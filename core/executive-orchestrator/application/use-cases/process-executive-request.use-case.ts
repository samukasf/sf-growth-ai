import {
  ExecutiveContextResolver,
  ExecutiveRequest,
  ExecutiveSession,
  createEnterpriseSnapshotLoadedEvent,
  createEnterpriseSnapshotRequestedEvent,
  createExecutiveConsensusCompletedEvent,
  createExecutiveConsensusStartedEvent,
  createExecutiveExecutiveInvitedEvent,
  createExecutiveRequestReceivedEvent,
  createExecutiveResponseGeneratedEvent,
  createExecutiveWorkflowStartedEvent,
  createOrchestratorContextResolvedEvent,
  createOrchestratorRoutingCompletedEvent,
} from "../../domain";
import type { ExecutiveParticipantId } from "../../shared";
import type { ProcessExecutiveRequestDto } from "../dto";
import type { ExecutiveOrchestratorEngineDependencies } from "../dependencies";

const INVITE_REASONS: Record<ExecutiveParticipantId, string> = {
  executive_context: "Resolver contexto operacional da solicitação",
  marketing: "Analisar oportunidades de marketing e aquisição",
  sales: "Avaliar impacto em vendas e conversão",
  finance: "Validar viabilidade financeira e ROI",
  forecast: "Projetar cenários e projeções",
  innovation: "Identificar oportunidades de inovação",
  operations: "Avaliar impacto operacional",
  experience: "Consultar experiências anteriores",
  wisdom: "Aplicar sabedoria e melhores práticas",
  legal: "Verificar requisitos legais e compliance",
  hr: "Avaliar impacto em pessoas e equipe",
  project_generator: "Estruturar projetos executáveis",
  crm: "Analisar relacionamento com clientes",
  google_business: "Otimizar presença digital local",
  knowledge: "Recuperar conhecimento relevante",
  learning: "Aplicar aprendizados anteriores",
  memory: "Consultar memória factual da empresa",
  company_brain: "Enriquecer com inteligência corporativa",
  ceo: "Consolidar decisão executiva final",
};

export class ProcessExecutiveRequestUseCase {
  constructor(private readonly deps: ExecutiveOrchestratorEngineDependencies) {}

  async execute(dto: ProcessExecutiveRequestDto) {
    const organizationId = dto.organizationId ?? "default-org";
    const session = await this.resolveSession(dto);

    const request = ExecutiveRequest.create({
      companyId: dto.companyId,
      sessionId: session.id,
      query: dto.query,
      metadata: {
        ...dto.metadata,
        organizationId,
      },
    });

    await this.deps.repository.saveRequest(request);
    await this.deps.eventDispatcher.publish(createExecutiveRequestReceivedEvent(request));

    await this.deps.eventDispatcher.publish(
      createEnterpriseSnapshotRequestedEvent({
        requestId: request.id,
        organizationId,
        companyId: dto.companyId,
      }),
    );

    const snapshot = await this.deps.enterpriseBrainRuntime.buildSnapshot(
      organizationId,
      dto.companyId,
    );

    await this.deps.eventDispatcher.publish(
      createEnterpriseSnapshotLoadedEvent({
        requestId: request.id,
        organizationId,
        companyId: dto.companyId,
        snapshot,
      }),
    );

    const brainContext = await this.deps.enterpriseBrainRuntime.buildContext(
      organizationId,
      dto.companyId,
    );

    await this.deps.eventDispatcher.publish(
      createOrchestratorContextResolvedEvent({
        requestId: request.id,
        organizationId,
        companyId: dto.companyId,
        snapshot,
        brainContext,
      }),
    );

    const legacyBrainContext = await this.deps.companyBrain.enrichContext(
      dto.query,
      dto.companyId,
    );

    const contextResolver = ExecutiveContextResolver.create({
      companyId: dto.companyId,
      requestId: request.id,
      query: dto.query,
      resolved: {
        goals: this.extractGoals(dto.query, snapshot.priorities),
        constraints: snapshot.risks,
        signals: [
          ...snapshot.activeSignals.map((signal) => signal.title),
          ...Object.keys(brainContext.businessContext),
          ...Object.keys(legacyBrainContext),
        ],
      },
      confidence: snapshot.confidence,
    });
    await this.deps.repository.saveContextResolver(contextResolver);

    const routing = this.deps.routingEngine.route(
      request,
      this.deps.decisionTree,
      { snapshot, brainContext },
    );

    let participants = this.deps.dependencyResolver.resolve(routing.participants);
    participants = this.deps.priorityResolver.resolve(participants);

    if (!participants.includes("ceo")) {
      participants = [...participants, "ceo"];
    }

    await this.deps.eventDispatcher.publish(
      createOrchestratorRoutingCompletedEvent({
        requestId: request.id,
        organizationId,
        companyId: dto.companyId,
        routing,
        participants,
      }),
    );

    for (const participantId of participants) {
      await this.deps.eventDispatcher.publish(
        createExecutiveExecutiveInvitedEvent({
          requestId: request.id,
          companyId: dto.companyId,
          participantId,
          reason: INVITE_REASONS[participantId],
        }),
      );
    }

    const workflow = this.deps.workflowEngine
      .start(this.deps.workflowEngine.createWorkflow(request, participants));
    await this.deps.repository.saveWorkflow(workflow);
    await this.deps.eventDispatcher.publish(createExecutiveWorkflowStartedEvent(workflow));

    const contributions = [];
    for (const participantId of participants) {
      if (participantId === "ceo") continue;

      const port = this.deps.participantRegistry.getPort(participantId);
      if (!port) continue;

      const contribution = await port.contribute(dto.query, {
        ...legacyBrainContext,
        brainSnapshot: snapshot,
        brainContext: brainContext,
        context: contextResolver.toJSON(),
        intent: routing.intent,
        risks: snapshot.risks,
        opportunities: snapshot.opportunities,
        priorities: snapshot.priorities,
      });
      contributions.push(contribution);
    }

    const consensusDraft = this.deps.consensusEngine.start(request, contributions);
    await this.deps.eventDispatcher.publish(
      createExecutiveConsensusStartedEvent(consensusDraft),
    );

    const consensus = this.deps.consensusEngine.consolidate(consensusDraft);
    await this.deps.repository.saveConsensus(consensus);
    await this.deps.eventDispatcher.publish(
      createExecutiveConsensusCompletedEvent(consensus),
    );

    const executionPlan = this.deps.executionCoordinator.coordinate(
      request,
      consensus,
      participants,
    );
    await this.deps.repository.saveExecutionPlan(executionPlan);

    const response = await this.deps.executiveCeo.finalizeResponse({
      query: dto.query,
      consensus: consensus.consolidatedOpinion,
      recommendation: consensus.consolidatedRecommendation,
      confidence: consensus.averageConfidence,
    });

    const completedWorkflow = this.deps.workflowEngine.complete(workflow);
    await this.deps.repository.saveWorkflow(completedWorkflow);

    const completedRequest = request.updateStatus("completed");
    await this.deps.repository.saveRequest(completedRequest);
    await this.deps.repository.saveSession(session.recordActivity());

    await this.deps.eventDispatcher.publish(
      createExecutiveResponseGeneratedEvent({
        requestId: request.id,
        companyId: dto.companyId,
        response,
        participants,
        confidence: consensus.averageConfidence,
      }),
    );

    return {
      request: completedRequest,
      session,
      snapshot,
      brainContext,
      context: contextResolver,
      routing,
      workflow: completedWorkflow,
      consensus,
      executionPlan,
      response,
      participants,
    };
  }

  private async resolveSession(dto: ProcessExecutiveRequestDto): Promise<ExecutiveSession> {
    if (dto.sessionId) {
      const existing = await this.deps.repository.findSessionById(dto.sessionId);
      if (existing) return existing;
    }

    const session = ExecutiveSession.create({
      companyId: dto.companyId,
      userId: dto.userId,
    });
    await this.deps.repository.saveSession(session);
    return session;
  }

  private extractGoals(query: string, priorities: string[]): string[] {
    if (priorities.length > 0) {
      return priorities.slice(0, 3);
    }

    const normalized = query.toLowerCase();
    if (normalized.includes("faturamento") || normalized.includes("receita")) {
      return ["Aumentar faturamento"];
    }
    if (normalized.includes("custo") || normalized.includes("reduzir")) {
      return ["Reduzir custos"];
    }
    if (normalized.includes("unidade") || normalized.includes("expandir")) {
      return ["Expandir operação"];
    }
    if (normalized.includes("melhorar")) {
      return ["Melhorar operação"];
    }
    return ["Responder solicitação executiva"];
  }
}
