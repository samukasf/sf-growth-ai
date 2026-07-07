import {
  Lead,
  RelationshipProfile,
  createLeadCreatedEvent,
} from "../../domain";
import type { CreateLeadDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class CreateLeadUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: CreateLeadDto) {
    const leadScore = this.deps.leadScoringEngine.score(
      Lead.create({
        organizationId: dto.organizationId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        source: dto.source,
        ownerId: dto.ownerId,
        notes: dto.notes ?? "",
      }),
    );

    const lead = Lead.create({
      organizationId: dto.organizationId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      source: dto.source,
      ownerId: dto.ownerId,
      notes: dto.notes ?? "",
      score: leadScore.value,
    });

    await this.deps.leadRepository.save(lead);

    const profile = RelationshipProfile.create({
      organizationId: dto.organizationId,
      entityId: lead.id,
      entityType: "lead",
      communicationPreferences: [],
      purchaseHistory: [],
      interactionHistory: [],
      satisfactionScore: 50,
      relationshipScore: leadScore.value,
      riskScore: 30,
      lifetimeValue: 0,
      recommendedActions: [],
    });

    await this.deps.crmRepository.saveRelationshipProfile(profile);
    await this.deps.eventDispatcher.publish(createLeadCreatedEvent(lead));

    return { lead, leadScore, profile };
  }
}
