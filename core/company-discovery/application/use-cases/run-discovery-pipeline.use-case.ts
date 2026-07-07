import {
  createBusinessProfileUpdatedEvent,
  createDiscoveryCompletedEvent,
  createGapDetectedEvent,
  createOpportunityDetectedEvent,
  DiscoveryScore,
  type DiscoveryReport,
} from "../../domain";
import { DiscoverySessionNotFoundError } from "../../shared";
import type { RunDiscoveryDto } from "../dto";
import type { CompanyDiscoveryDependencies } from "../dependencies";

export class RunDiscoveryPipelineUseCase {
  constructor(private readonly deps: CompanyDiscoveryDependencies) {}

  async execute(dto: RunDiscoveryDto) {
    const session = await this.deps.repository.findSessionById(dto.sessionId);
    if (!session) throw new DiscoverySessionNotFoundError(dto.sessionId);

    const context = dto.context ?? {};

    let currentSession = session.withStatus("collecting");
    await this.deps.repository.saveSession(currentSession);

    const { sources, findings, session: collectingSession } = await this.deps.coordinator.coordinate({
      session: currentSession,
      sourceTypes: currentSession.sourceTypes,
      context,
      providers: this.deps.sourceProviders,
    });

    for (const source of sources) {
      await this.deps.repository.saveSource(source);
    }
    for (const finding of findings) {
      await this.deps.repository.saveFinding(finding);
    }
    currentSession = collectingSession;

    currentSession = currentSession.withStatus("analyzing");
    await this.deps.repository.saveSession(currentSession);

    const analysis = await this.deps.analyzer.analyze({ findings, context });

    for (const finding of analysis.normalizedFindings) {
      await this.deps.repository.saveFinding(finding);
    }

    currentSession = currentSession.withStatus("profiling");
    await this.deps.repository.saveSession(currentSession);

    const existingProfile = await this.deps.repository.findProfileByCompany(currentSession.companyId);
    const profile = await this.deps.profiler.build({
      organizationId: currentSession.organizationId,
      companyId: currentSession.companyId,
      companyName: currentSession.companyName,
      findings: analysis.normalizedFindings,
      existingProfile: existingProfile ?? undefined,
    });

    const profileWithSession = profile.withCompleteness(
      profile.completenessScore,
      currentSession.id,
    );
    await this.deps.repository.saveProfile(profileWithSession);
    await this.deps.eventDispatcher.publish(createBusinessProfileUpdatedEvent(profileWithSession));

    const gaps = this.deps.gapAnalyzer.analyze({
      sessionId: currentSession.id,
      profile: profileWithSession,
      findings: analysis.normalizedFindings,
    });

    for (const gap of gaps) {
      await this.deps.repository.saveGap(gap);
      await this.deps.eventDispatcher.publish(
        createGapDetectedEvent(gap, currentSession.organizationId, currentSession.companyId),
      );
    }

    const opportunities = this.deps.opportunityDetector.detect({
      sessionId: currentSession.id,
      profile: profileWithSession,
      findings: analysis.normalizedFindings,
    });

    for (const opportunity of opportunities) {
      await this.deps.repository.saveOpportunity(opportunity);
      await this.deps.eventDispatcher.publish(
        createOpportunityDetectedEvent(
          opportunity,
          currentSession.organizationId,
          currentSession.companyId,
        ),
      );
    }

    const score = DiscoveryScore.create({
      sessionId: currentSession.id,
      dimensions: [
        { key: "identity", label: "Identidade", score: profileWithSession.sections.find((s) => s.key === "identity")?.confidence ?? 0, weight: 1 },
        { key: "operations", label: "Operações", score: profileWithSession.sections.find((s) => s.key === "operations")?.confidence ?? 0, weight: 1.2 },
        { key: "commercial", label: "Comercial", score: profileWithSession.sections.find((s) => s.key === "commercial")?.confidence ?? 0, weight: 1.2 },
        { key: "finance", label: "Finanças", score: profileWithSession.sections.find((s) => s.key === "finance")?.confidence ?? 0, weight: 1 },
      ],
      profileCompleteness: profileWithSession.completenessScore,
      dataQuality: analysis.averageConfidence,
      readinessScore: Math.min(100, profileWithSession.completenessScore + analysis.averageConfidence / 2),
    });
    await this.deps.repository.saveScore(score);

    currentSession = currentSession.withStatus("reporting");
    await this.deps.repository.saveSession(currentSession);

    const report = this.deps.reporter.generate({
      session: currentSession,
      profile: profileWithSession,
      score,
      gaps,
      opportunities,
    });

    currentSession = currentSession
      .withStatus("completed")
      .withCounts({
        findingsCount: analysis.normalizedFindings.length,
        gapsCount: gaps.length,
        opportunitiesCount: opportunities.length,
        profileCompleteness: profileWithSession.completenessScore,
      });
    await this.deps.repository.saveSession(currentSession);
    await this.deps.eventDispatcher.publish(createDiscoveryCompletedEvent(currentSession));

    await this.deps.repository.saveReport(currentSession.id, report);

    await this.syncIntegrations(currentSession, profileWithSession, gaps, opportunities, report);

    return { session: currentSession, profile: profileWithSession, report };
  }

  private async syncIntegrations(
    session: import("../../domain").DiscoverySession,
    profile: import("../../domain").CompanyProfile,
    gaps: import("../../domain").DiscoveryGap[],
    opportunities: import("../../domain").DiscoveryOpportunity[],
    report: DiscoveryReport,
  ) {
    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.syncProfile(profile);
    }
    if (this.deps.executiveKnowledge.isAvailable()) {
      await this.deps.executiveKnowledge.ingestProfile(profile);
    }
    if (this.deps.executiveMemory.isAvailable()) {
      await this.deps.executiveMemory.storeDiscoveryInsights(
        session.organizationId,
        session.companyId,
        { report: report.summary, score: report.score.overallScore },
      );
    }
    if (this.deps.executiveInnovation.isAvailable()) {
      await this.deps.executiveInnovation.submitOpportunities(
        session.organizationId,
        session.companyId,
        opportunities.map((o) => o.toJSON() as Record<string, unknown>),
      );
    }
    if (this.deps.executiveProjectGenerator.isAvailable()) {
      await this.deps.executiveProjectGenerator.generateFromGaps(
        session.organizationId,
        session.companyId,
        gaps.map((g) => g.toJSON() as Record<string, unknown>),
      );
    }
  }
}
