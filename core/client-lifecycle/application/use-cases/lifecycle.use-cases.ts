import {
  ClientJourney,
  ClientLead,
  createClientOnboardedEvent,
  createClientRecoveredEvent,
  createCompanyBrainActivatedEvent,
  createHealthScoreUpdatedEvent,
  createLeadCreatedEvent,
  createProposalAcceptedEvent,
  createRenewalSuggestedEvent,
  createUpsellDetectedEvent,
} from "../../domain";
import type { CreateLeadDto } from "../dto";
import type { ClientLifecycleDependencies } from "../dependencies";

export class CreateLeadUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(dto: CreateLeadDto) {
    const companyId = dto.companyId ?? `company-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const lead = ClientLead.create({
      organizationId: dto.organizationId,
      agencyId: dto.agencyId,
      companyId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      source: dto.source,
    });

    const journey = ClientJourney.create({
      organizationId: dto.organizationId,
      agencyId: dto.agencyId,
      companyId,
      clientName: dto.name,
      phase: "lead",
      leadId: lead.id,
    });

    await this.deps.repository.saveLead(lead);
    await this.deps.repository.saveJourney(journey);
    await this.deps.eventDispatcher.publish(createLeadCreatedEvent(lead, journey.id));
    await this.deps.journeyCoordinator.coordinateLeadCreated(journey, lead);

    await this.deps.timelineBuilder.append({
      organizationId: dto.organizationId,
      agencyId: dto.agencyId,
      companyId,
      journeyId: journey.id,
      eventType: "LeadCreated",
      title: "Lead criado",
      description: `Lead ${dto.name} recebido via ${dto.source}`,
      occurredAt: new Date().toISOString(),
    });

    if (this.deps.executiveCrm.isAvailable()) {
      await this.deps.executiveCrm.syncLead(dto.organizationId, dto.agencyId, lead.id, dto.name);
    }

    return { lead, journey };
  }
}

export class AcceptProposalUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(agencyId: string, proposalId: string) {
    const proposal = await this.deps.repository.findProposal(agencyId, proposalId);
    if (!proposal) throw new Error(`Proposal not found: ${proposalId}`);

    const accepted = proposal.withStatus("accepted");
    await this.deps.repository.saveProposal(accepted);

    const journey = await this.deps.repository.findJourneyByCompany(agencyId, accepted.companyId);
    if (journey) {
      const updated = journey.advanceTo("contract", { proposalId: accepted.id });
      await this.deps.repository.saveJourney(updated);
      await this.deps.journeyCoordinator.coordinateProposalAccepted(updated, accepted);
    }

    await this.deps.eventDispatcher.publish(
      createProposalAcceptedEvent(accepted, journey?.id),
    );

    if (this.deps.executiveCrm.isAvailable()) {
      await this.deps.executiveCrm.syncProposalAccepted(
        accepted.organizationId,
        agencyId,
        accepted.companyId,
        accepted.id,
      );
    }

    return { proposal: accepted };
  }
}

export class CompleteOnboardingUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(agencyId: string, onboardingId: string) {
    const onboarding = await this.deps.repository.findOnboarding(agencyId, onboardingId);
    if (!onboarding) throw new Error(`Onboarding not found: ${onboardingId}`);

    let updated = onboarding;
    for (const item of onboarding.checklist) {
      if (!item.completed) updated = updated.completeItem(item.id);
    }

    await this.deps.repository.saveOnboarding(updated);

    const journey = await this.deps.repository.findJourneyByCompany(agencyId, updated.companyId);
    if (journey) {
      const advanced = journey.advanceTo("active", { onboardingId: updated.id });
      await this.deps.repository.saveJourney(advanced);
      await this.deps.journeyCoordinator.coordinateOnboardingCompleted(advanced, updated);
    }

    await this.deps.eventDispatcher.publish(createClientOnboardedEvent(updated, journey?.id));

    if (this.deps.agencyCore.isAvailable()) {
      const j = await this.deps.repository.findJourneyByCompany(agencyId, updated.companyId);
      if (j) {
        await this.deps.agencyCore.registerClient(
          updated.organizationId,
          agencyId,
          updated.companyId,
          j.clientName,
        );
      }
    }

    return { onboarding: updated };
  }
}

export class ActivateCompanyBrainUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(agencyId: string, journeyId: string) {
    const journey = await this.deps.repository.findJourney(agencyId, journeyId);
    if (!journey) throw new Error(`Journey not found: ${journeyId}`);

    await this.deps.journeyCoordinator.coordinateCompanyBrainActivation(journey);

    const activated = journey.withCompanyBrainActive(true);
    await this.deps.repository.saveJourney(activated);

    await this.deps.eventDispatcher.publish(
      createCompanyBrainActivatedEvent({
        organizationId: activated.organizationId,
        agencyId: activated.agencyId,
        companyId: activated.companyId,
        journeyId: activated.id,
        companyBrainId: activated.executiveStack.companyBrainId,
        executiveStack: activated.executiveStack,
      }),
    );

    return { journey: activated };
  }
}

export class EvaluateHealthUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(organizationId: string, agencyId: string, companyId: string) {
    const health = await this.deps.healthEngine.evaluate(organizationId, agencyId, companyId);
    await this.deps.repository.saveHealth(health);

    const journey = await this.deps.repository.findJourneyByCompany(agencyId, companyId);
    if (journey) {
      const updated = journey.withScores(health.scores.overall, health.growthScore);
      await this.deps.repository.saveJourney(updated);
    }

    await this.deps.eventDispatcher.publish(createHealthScoreUpdatedEvent(health, journey?.id));

    return { health };
  }
}

export class SuggestRenewalUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(organizationId: string, agencyId: string, companyId: string, contractId: string) {
    const renewal = await this.deps.renewalEngine.suggest(
      organizationId,
      agencyId,
      companyId,
      contractId,
    );
    if (!renewal) return { renewal: null };

    await this.deps.repository.saveRenewal(renewal);

    const journey = await this.deps.repository.findJourneyByCompany(agencyId, companyId);
    if (journey) {
      await this.deps.repository.saveJourney(journey.advanceTo("renewal"));
    }

    await this.deps.eventDispatcher.publish(createRenewalSuggestedEvent(renewal, journey?.id));

    return { renewal };
  }
}

export class DetectUpsellUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(organizationId: string, agencyId: string, companyId: string) {
    const upsell = await this.deps.upsellEngine.detect(organizationId, agencyId, companyId);
    if (!upsell) return { upsell: null };

    await this.deps.repository.saveUpsell(upsell);

    const journey = await this.deps.repository.findJourneyByCompany(agencyId, companyId);
    if (journey) {
      await this.deps.repository.saveJourney(journey.advanceTo("upsell"));
    }

    await this.deps.eventDispatcher.publish(createUpsellDetectedEvent(upsell, journey?.id));

    return { upsell };
  }
}

export class RecoverClientUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(agencyId: string, companyId: string) {
    const existing = await this.deps.repository.findRelationship(agencyId, companyId);
    const relationship = existing
      ? await this.deps.relationshipManager.recover(existing)
      : await this.deps.relationshipManager.assess("", agencyId, companyId);

    await this.deps.repository.saveRelationship(relationship);

    const journey = await this.deps.repository.findJourneyByCompany(agencyId, companyId);
    if (journey) {
      await this.deps.repository.saveJourney(journey.advanceTo("recovered"));
    }

    await this.deps.eventDispatcher.publish(createClientRecoveredEvent(relationship, journey?.id));

    return { relationship };
  }
}

export class GetJourneyUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(agencyId: string, journeyId: string) {
    const journey = await this.deps.repository.findJourney(agencyId, journeyId);
    return { journey };
  }
}

export class BuildTimelineUseCase {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async execute(journeyId: string) {
    const timeline = await this.deps.timelineBuilder.build(journeyId);
    return { timeline };
  }
}
