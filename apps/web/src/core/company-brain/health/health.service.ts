import type { CompanyBrain, DiscoveryResult } from "../company-brain.types";
import type { KnowledgeGraph } from "../knowledge/knowledge.types";
import type { TimelineEvent } from "../timeline/timeline.types";
import {
  HealthCalculator,
  healthCalculator,
  HealthTrendAnalyzer,
  healthTrendAnalyzer,
  type CompanyHealthScoresLookup,
} from "./health.calculator";
import { buildHealthContextFromIntegrations } from "./health.mapper";
import type { HealthRepository } from "./health.repository";
import { getDefaultHealthRepository } from "./health.repository";
import type {
  CompanyHealth,
  HealthCalculationContext,
  HealthComparison,
  HealthDimension,
  HealthRecommendation,
  HealthScore,
  HealthTrend,
} from "./health.types";

export class CompanyHealthService {
  constructor(
    private readonly repository: HealthRepository,
    private readonly calculator: HealthCalculator = healthCalculator,
    private readonly trendAnalyzer: HealthTrendAnalyzer = healthTrendAnalyzer,
  ) {}

  async calculate(context: HealthCalculationContext): Promise<CompanyHealth> {
    const previous = await this.repository.findLatestByCompany(context.brain.companyId);
    const previousLookup = this.toPreviousLookup(previous);
    const result = this.calculator.calculate(context, previousLookup);
    const health = this.buildCompanyHealth(context, result);
    await this.repository.save(health);
    return health;
  }

  async recalculate(input: {
    brain: CompanyBrain;
    discovery?: DiscoveryResult;
    timelineEvents?: TimelineEvent[];
    knowledgeGraph?: KnowledgeGraph;
  }): Promise<CompanyHealth> {
    const context = buildHealthContextFromIntegrations(input);
    return this.calculate(context);
  }

  async getOverallScore(companyId: string): Promise<HealthScore | null> {
    const latest = await this.repository.findLatestByCompany(companyId);
    return latest?.overall ?? null;
  }

  async getDimensionScore(
    companyId: string,
    dimension: HealthDimension,
  ): Promise<HealthScore | null> {
    const latest = await this.repository.findLatestByCompany(companyId);
    if (!latest) return null;
    if (dimension === "overall") return latest.overall;
    return latest.dimensions.find((score) => score.dimension === dimension) ?? null;
  }

  async compare(companyId: string): Promise<HealthComparison | null> {
    const history = await this.repository.findHistoryByCompany(companyId, 2);
    if (history.length === 0) return null;

    const current = history.at(-1)!;
    const previous = history.length > 1 ? history.at(-2)! : null;

    const improved: HealthDimension[] = [];
    const declined: HealthDimension[] = [];
    const unchanged: HealthDimension[] = [];

    const allDimensions: HealthDimension[] = [
      "overall",
      ...current.dimensions.map((score) => score.dimension),
    ];

    for (const dimension of allDimensions) {
      const currentScore =
        dimension === "overall"
          ? current.overall.value
          : current.dimensions.find((score) => score.dimension === dimension)?.value ?? 0;
      const previousScore =
        !previous
          ? null
          : dimension === "overall"
            ? previous.overall.value
            : previous.dimensions.find((score) => score.dimension === dimension)?.value ?? 0;

      if (previousScore === null) {
        unchanged.push(dimension);
        continue;
      }

      if (currentScore > previousScore) improved.push(dimension);
      else if (currentScore < previousScore) declined.push(dimension);
      else unchanged.push(dimension);
    }

    return { current, previous, improved, declined, unchanged };
  }

  async getTrends(companyId: string): Promise<HealthTrend[]> {
    const history = await this.repository.findHistoryByCompany(companyId, 2);
    const latest = history.at(-1);
    if (!latest) return [];

    const previous = history.length > 1 ? history.at(-2)! : null;
    const previousScores = previous
      ? [previous.overall, ...previous.dimensions]
      : null;

    return this.trendAnalyzer.analyze(
      [latest.overall, ...latest.dimensions],
      previousScores,
    );
  }

  async getCriticalDimensions(companyId: string): Promise<HealthScore[]> {
    const latest = await this.repository.findLatestByCompany(companyId);
    if (!latest) return [];

    return [latest.overall, ...latest.dimensions].filter(
      (score) => score.status === "Critical" || score.status === "Weak" || score.incomplete,
    );
  }

  async getRecommendations(companyId: string): Promise<HealthRecommendation[]> {
    const latest = await this.repository.findLatestByCompany(companyId);
    if (!latest) return [];

    return [latest.overall, ...latest.dimensions]
      .flatMap((score) => score.recommendations)
      .slice(0, 10);
  }

  async getLatest(companyId: string): Promise<CompanyHealth | null> {
    return this.repository.findLatestByCompany(companyId);
  }

  private buildCompanyHealth(
    context: HealthCalculationContext,
    result: ReturnType<HealthCalculator["calculate"]>,
  ): CompanyHealth {
    return {
      id: `health-${context.brain.companyId}-${Date.now()}`,
      tenantId: context.brain.organizationId,
      companyId: context.brain.companyId,
      companyName: context.brain.companyName,
      segment: context.brain.companyProfile.industry ?? "default",
      overall: result.overall,
      dimensions: result.dimensions,
      calculatedAt: result.overall.updatedAt,
      topFactors: result.topFactors,
      criticalDimensions: result.criticalDimensions,
    };
  }

  private toPreviousLookup(previous: CompanyHealth | null): CompanyHealthScoresLookup | undefined {
    if (!previous) return undefined;

    const lookup: CompanyHealthScoresLookup = {
      overall: previous.overall.value,
    };

    for (const score of previous.dimensions) {
      lookup[score.dimension] = score.value;
    }

    return lookup;
  }
}

let defaultService: CompanyHealthService | null = null;

export function getCompanyHealthService(): CompanyHealthService {
  if (!defaultService) {
    defaultService = new CompanyHealthService(getDefaultHealthRepository());
  }
  return defaultService;
}
