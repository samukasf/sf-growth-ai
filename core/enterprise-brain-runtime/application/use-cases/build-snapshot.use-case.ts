import {
  createBrainHealthAnalyzedEvent,
  createBrainSignalProcessedEvent,
  createBrainSnapshotCreatedEvent,
  createBrainStateChangedEvent,
} from "../../domain";
import { clampScore } from "../../shared";
import type { BuildSnapshotDto } from "../dto";
import type { EnterpriseBrainRuntimeDependencies } from "../dependencies";

export class BuildSnapshotUseCase {
  constructor(private readonly deps: EnterpriseBrainRuntimeDependencies) {}

  async execute(dto: BuildSnapshotDto) {
    await this.deps.stateManager.transition(dto.organizationId, dto.companyId, "syncing");

    const contributions = await this.deps.dataSources.fetchAll(
      dto.organizationId,
      dto.companyId,
    );

    const summaries = this.deps.summaryBuilder.buildAll(contributions);
    const signals = this.deps.signalProcessor.process(contributions);
    const relationships = this.deps.relationshipMapper.map(contributions);

    let businessContext: Record<string, string> = {
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      sourceCount: String(contributions.filter((c) => c.available).length),
    };

    if (this.deps.executiveReasoning.isAvailable() && this.deps.executiveReasoning.enrichBusinessContext) {
      businessContext = await this.deps.executiveReasoning.enrichBusinessContext({
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        context: businessContext,
      });
    }

    const risks = this.deps.signalProcessor.extractRisks(signals);
    const opportunities = this.deps.signalProcessor.extractOpportunities(signals);
    let priorities = this.deps.signalProcessor.extractPriorities(signals);

    if (this.deps.executiveCeo.isAvailable() && this.deps.executiveCeo.prioritizeSnapshot) {
      priorities = await this.deps.executiveCeo.prioritizeSnapshot({
        organizationId: dto.organizationId,
        priorities,
      });
    }

    const health = this.deps.healthAnalyzer.analyze(contributions);
    const confidence = clampScore(
      (health.overallScore +
        summaries.memory.healthScore +
        summaries.knowledge.healthScore) /
        3,
    );

    const snapshot = this.deps.snapshotBuilder.build({
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      businessContext,
      contributions,
      memorySummary: summaries.memory,
      knowledgeSummary: summaries.knowledge,
      learningSummary: summaries.learning,
      experienceSummary: summaries.experience,
      wisdomSummary: summaries.wisdom,
      organizationSummary: summaries.organization,
      activeSignals: signals,
      risks,
      opportunities,
      priorities,
      confidence,
    });

    await this.deps.repository.saveSnapshot(snapshot);
    await this.deps.repository.saveRelationships(relationships);

    await this.deps.stateManager.markSynced(
      dto.organizationId,
      dto.companyId,
      contributions.filter((c) => c.available).map((c) => c.source),
    );
    const readyState = await this.deps.stateManager.transition(
      dto.organizationId,
      dto.companyId,
      "ready",
      snapshot.id,
    );

    await this.deps.eventDispatcher.publish(createBrainSnapshotCreatedEvent(snapshot));
    await this.deps.eventDispatcher.publish(createBrainStateChangedEvent(readyState));
    await this.deps.eventDispatcher.publish(
      createBrainHealthAnalyzedEvent(health, dto.organizationId, dto.companyId),
    );

    for (const signal of signals) {
      await this.deps.eventDispatcher.publish(
        createBrainSignalProcessedEvent(signal, dto.organizationId, dto.companyId),
      );
    }

    if (this.deps.executiveOrchestrator.isAvailable()) {
      await this.deps.executiveOrchestrator.notifySnapshotBuilt?.({
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        snapshotId: snapshot.id,
      });
    }

    if (this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.notifyBrainSnapshot?.({
        organizationId: dto.organizationId,
        snapshotId: snapshot.id,
      });
    }

    return { snapshot, health, relationships, state: readyState };
  }
}
