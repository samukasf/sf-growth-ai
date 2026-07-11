import {
  createConflictDetectedEvent,
  createConsensusReachedEvent,
  createCouncilDecisionCompletedEvent,
  createCouncilMemberInvitedEvent,
  createCouncilSessionStartedEvent,
  createOpinionSubmittedEvent,
  ExecutiveCouncil,
} from "../../domain";
import type { ProcessCouncilDto } from "../dto";
import type { ExecutiveCouncilDependencies } from "../dependencies";

const ALL_ROLES: import("../../shared").CouncilSpecialistRole[] = [
  "ceo",
  "finance",
  "marketing",
  "sales",
  "operations",
  "hr",
  "legal",
  "crm",
  "communication",
  "commerce",
  "scheduling",
  "innovation",
  "projects",
];

export class ProcessCouncilSessionUseCase {
  constructor(private readonly deps: ExecutiveCouncilDependencies) {}

  async execute(dto: ProcessCouncilDto) {
    let council = await this.deps.repository.findCouncilById(
      `council-${dto.organizationId}`,
    );

    if (!council) {
      council = ExecutiveCouncil.create({
        id: `council-${dto.organizationId}`,
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        name: "Executive Council",
        availableRoles: ALL_ROLES,
      });
      await this.deps.repository.saveCouncil(council);
    }

    const selectedRoles = this.deps.memberSelector.select({
      query: dto.query,
      risks: dto.risks ?? [],
      opportunities: dto.opportunities ?? [],
      priorities: dto.priorities ?? [],
      suggestedRoles: dto.suggestedRoles,
    });

    const { session, members } = await this.deps.sessionManager.start({
      council,
      requestId: dto.requestId,
      query: dto.query,
      brainSnapshotId: dto.brainSnapshotId,
      roles: selectedRoles,
    });

    await this.deps.repository.saveSession(session);
    await this.deps.eventDispatcher.publish(createCouncilSessionStartedEvent(session));

    for (const member of members) {
      await this.deps.repository.saveMember(member);
      await this.deps.eventDispatcher.publish(
        createCouncilMemberInvitedEvent(member, dto.organizationId, dto.companyId),
      );
    }

    /**
     * Contexto enriquecido (Sprint 78): organizationId/companyId/risks/
     * opportunities/priorities já existiam no DTO — aqui passam a ser
     * também lidos pelo coletor/especialistas de IA (ex.: para compor o
     * prompt de cada conselheiro). Nenhum valor é recalculado; apenas
     * repassado. `dto.context` continua tendo precedência para qualquer
     * outra chave que já viesse sendo enviada.
     */
    const specialistContext: Record<string, unknown> = {
      ...(dto.context ?? {}),
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      risks: dto.risks ?? [],
      opportunities: dto.opportunities ?? [],
      priorities: dto.priorities ?? [],
    };

    const { opinions, failures: opinionFailures } = await this.deps.opinionCollector.collect(
      session.id,
      members,
      dto.query,
      specialistContext,
      this.deps.specialists,
    );

    for (const opinion of opinions) {
      await this.deps.repository.saveOpinion(opinion);
      await this.deps.eventDispatcher.publish(
        createOpinionSubmittedEvent(opinion, dto.organizationId, dto.companyId),
      );
    }

    const conflicts = this.deps.conflictResolver.detect(session.id, opinions);
    for (const conflict of conflicts) {
      await this.deps.repository.saveConflict(conflict);
      await this.deps.eventDispatcher.publish(
        createConflictDetectedEvent(conflict, dto.organizationId, dto.companyId),
      );
    }

    const resolvedConflicts = this.deps.conflictResolver.resolve(conflicts);
    for (const conflict of resolvedConflicts) {
      await this.deps.repository.saveConflict(conflict);
    }

    const consensus = this.deps.consensusBuilder.build(session.id, opinions);
    await this.deps.repository.saveConsensus(consensus);
    await this.deps.eventDispatcher.publish(
      createConsensusReachedEvent(consensus, dto.organizationId, dto.companyId),
    );

    const recommendations = this.deps.recommendationAggregator.aggregate(
      session.id,
      consensus,
      opinions,
    );
    for (const recommendation of recommendations) {
      await this.deps.repository.saveRecommendation(recommendation);
    }

    const decision = this.deps.decisionBuilder.build(session.id, consensus);
    await this.deps.repository.saveDecision(decision);

    const response = await this.deps.executiveCeo.finalizeCouncilResponse({
      query: dto.query,
      consensus: consensus.consolidatedSummary,
      recommendation: consensus.consolidatedRecommendation,
      confidence: consensus.averageConfidence,
    });

    const completedSession = await this.deps.sessionManager.complete(session);
    await this.deps.repository.saveSession(completedSession);

    await this.deps.eventDispatcher.publish(
      createCouncilDecisionCompletedEvent({
        decision,
        response,
        organizationId: dto.organizationId,
        companyId: dto.companyId,
      }),
    );

    return {
      session: completedSession,
      members,
      opinions,
      conflicts: resolvedConflicts,
      consensus,
      decision,
      recommendations,
      response,
      opinionFailures,
    };
  }
}
