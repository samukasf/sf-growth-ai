import type {
  HealthCalculationContext,
  HealthDimension,
  HealthEvidence,
  HealthRecommendation,
  HealthScore,
  HealthTrend,
} from "./health.types";
import {
  mapBrainEvidence,
  mapDiscoveryEvidence,
  mapRecommendationsForDimension,
} from "./health.mapper";
import { HealthRulesEngine, healthRulesEngine, scaleToHealthRange } from "./health.rules";

type DimensionDraft = {
  dimension: Exclude<HealthDimension, "overall">;
  rawScore: number | null;
  baseConfidence: number;
  evidence: HealthEvidence[];
  recommendations: HealthRecommendation[];
  incomplete: boolean;
};

function sectionConfidence(
  discovery: HealthCalculationContext["discovery"],
  key: string,
): number {
  return discovery?.profile.sections.find((section) => section.key === key)?.confidence ?? 0;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export class HealthCalculator {
  constructor(private readonly rules: HealthRulesEngine = healthRulesEngine) {}

  calculate(context: HealthCalculationContext, previous?: CompanyHealthScoresLookup): HealthCalculatorResult {
    const now = new Date().toISOString();
    const drafts = this.buildDimensionDrafts(context);
    const weights = this.rules.resolveWeights(context.brain.companyProfile.industry ?? "default");

    const dimensions = drafts.map((draft) =>
      this.toHealthScore(draft, now, previous?.[draft.dimension] ?? null),
    );

    const overallValue = this.rules.calculateWeightedOverall(
      dimensions.map((score) => ({
        dimension: score.dimension as Exclude<HealthDimension, "overall">,
        value: score.value,
        incomplete: score.incomplete,
      })),
      weights,
    );

    const completeDimensions = dimensions.filter((score) => !score.incomplete);
    const overallEvidence = completeDimensions.flatMap((score) => score.evidence).slice(0, 6);
    const overallRecommendations = dimensions.flatMap((score) => score.recommendations).slice(0, 5);

    const overallIncomplete = completeDimensions.length === 0;
    const overallConfidence = this.rules.resolveConfidence(
      overallEvidence.length,
      overallIncomplete,
      average(completeDimensions.map((score) => score.confidence)),
    );

    const overall: HealthScore = {
      dimension: "overall",
      value: overallValue,
      previousValue: previous?.overall ?? null,
      variation:
        previous?.overall !== undefined && previous?.overall !== null
          ? overallValue - previous.overall
          : null,
      status: this.rules.statusForScore(overallValue, overallIncomplete),
      confidence: overallConfidence,
      updatedAt: now,
      incomplete: overallIncomplete,
      evidence: overallEvidence,
      recommendations: overallRecommendations,
    };

    return {
      overall,
      dimensions,
      topFactors: this.extractTopFactors(dimensions, context),
      criticalDimensions: dimensions
        .filter((score) => score.status === "Critical" || score.status === "Weak")
        .map((score) => score.dimension),
    };
  }

  private buildDimensionDrafts(context: HealthCalculationContext): DimensionDraft[] {
    const { brain, discovery } = context;
    const discoveryEvidence = discovery ? mapDiscoveryEvidence(discovery) : [];
    const timelineEvidence = this.timelineEvidenceFromContext(context);
    const knowledgeEvidence = this.knowledgeEvidenceFromContext(context);

    return [
      this.draft("marketing", brain.marketingStatus.score, sectionConfidence(discovery, "commercial"), [
        ...mapBrainEvidence(brain, "marketing"),
        ...discoveryEvidence,
        ...timelineEvidence,
      ], context),
      this.draft("sales", average([brain.marketingStatus.score, sectionConfidence(discovery, "commercial")]), sectionConfidence(discovery, "commercial"), [
        ...mapBrainEvidence(brain, "sales"),
        ...(brain.competitors.length > 0
          ? [{
              id: "hev-sales-competitors",
              source: "company-brain" as const,
              label: "Concorrentes mapeados",
              detail: brain.competitors.join(", "),
              weight: 0.7,
            }]
          : []),
      ], context),
      this.draft("financial", brain.financialStatus.score, sectionConfidence(discovery, "finance"), [
        ...mapBrainEvidence(brain, "financial"),
        ...discoveryEvidence,
      ], context),
      this.draft("operations", brain.operationalStatus.score, sectionConfidence(discovery, "operations"), [
        ...mapBrainEvidence(brain, "operations"),
        ...timelineEvidence,
      ], context),
      this.draft("technology", brain.digitalPresence.score, sectionConfidence(discovery, "technology"), [
        ...mapBrainEvidence(brain, "technology"),
        ...knowledgeEvidence,
      ], context),
      this.draft(
        "people",
        brain.values.length > 0 ? average([sectionConfidence(discovery, "identity"), brain.completenessScore]) : null,
        sectionConfidence(discovery, "identity"),
        brain.values.length > 0
          ? [{
              id: "hev-people-values",
              source: "company-brain",
              label: "Valores organizacionais",
              detail: brain.values.join(", "),
              weight: 0.8,
            }]
          : [],
        context,
        brain.values.length === 0,
      ),
      this.draft("digital_presence", brain.digitalPresence.score, sectionConfidence(discovery, "technology"), [
        ...mapBrainEvidence(brain, "digital_presence"),
        ...knowledgeEvidence,
      ], context),
      this.draft(
        "brand",
        brain.mission && brain.vision ? average([sectionConfidence(discovery, "identity"), brain.marketingStatus.score * 0.5]) : null,
        sectionConfidence(discovery, "identity"),
        mapBrainEvidence(brain, "brand"),
        context,
        !(brain.mission && brain.vision),
      ),
      this.draft(
        "customer_experience",
        brain.targetAudience.length > 0 ? sectionConfidence(discovery, "customers") : null,
        sectionConfidence(discovery, "customers"),
        mapBrainEvidence(brain, "customer_experience"),
        context,
        brain.targetAudience.length === 0,
      ),
      this.draft(
        "automation",
        sectionConfidence(discovery, "technology") > 0 ? sectionConfidence(discovery, "technology") * 0.8 : null,
        sectionConfidence(discovery, "technology"),
        knowledgeEvidence,
        context,
        sectionConfidence(discovery, "technology") === 0,
      ),
      this.draft(
        "ai_maturity",
        brain.knowledgeScore > 0 && (context.knowledgeNodeCount ?? 0) > 0
          ? average([brain.knowledgeScore, brain.confidenceScore, discovery?.report.score.readinessScore ?? 0])
          : null,
        average([brain.confidenceScore, discovery?.report.score.readinessScore ?? 0]),
        [
          ...knowledgeEvidence,
          {
            id: "hev-ai-confidence",
            source: "company-brain",
            label: "Confiança do brain",
            detail: `Confidence Score: ${brain.confidenceScore}/100.`,
            weight: 0.8,
          },
        ],
        context,
        (context.knowledgeNodeCount ?? 0) === 0,
      ),
    ];
  }

  private draft(
    dimension: Exclude<HealthDimension, "overall">,
    rawScore: number | null,
    baseConfidence: number,
    evidence: HealthEvidence[],
    context: HealthCalculationContext,
    forceIncomplete = false,
  ): DimensionDraft {
    const hasEvidence = this.rules.requiresEvidence(evidence.length);
    const incomplete = forceIncomplete || !hasEvidence || rawScore === null;

    return {
      dimension,
      rawScore: incomplete ? null : rawScore,
      baseConfidence,
      evidence: hasEvidence ? evidence : [],
      recommendations: mapRecommendationsForDimension(dimension, context.brain, context.discovery),
      incomplete,
    };
  }

  private toHealthScore(
    draft: DimensionDraft,
    updatedAt: string,
    previousValue: number | null,
  ): HealthScore {
    const value = draft.incomplete || draft.rawScore === null ? 0 : scaleToHealthRange(draft.rawScore);
    const confidence = this.rules.resolveConfidence(
      draft.evidence.length,
      draft.incomplete,
      draft.baseConfidence,
    );

    return {
      dimension: draft.dimension,
      value,
      previousValue,
      variation: previousValue !== null ? value - previousValue : null,
      status: this.rules.statusForScore(value, draft.incomplete),
      confidence,
      updatedAt,
      incomplete: draft.incomplete,
      evidence: draft.evidence,
      recommendations: draft.recommendations,
    };
  }

  private timelineEvidenceFromContext(context: HealthCalculationContext): HealthEvidence[] {
    if (!context.timelineHighlights?.length) return [];
    return context.timelineHighlights.map((highlight, index) => ({
      id: `hev-timeline-${index}`,
      source: "timeline" as const,
      label: highlight,
      detail: `Evento registrado na timeline (${context.timelineEventCount ?? 0} total).`,
      weight: 0.6,
    }));
  }

  private knowledgeEvidenceFromContext(context: HealthCalculationContext): HealthEvidence[] {
    if ((context.knowledgeNodeCount ?? 0) === 0) return [];
    return [
      {
        id: "hev-knowledge-nodes",
        source: "knowledge-graph",
        label: "Knowledge Graph",
        detail: `${context.knowledgeNodeCount} entidades · ${context.knowledgeRelationCount ?? 0} relações.`,
        weight: 0.85,
      },
      ...(context.knowledgeHighlights ?? []).slice(0, 2).map((highlight, index) => ({
        id: `hev-knowledge-highlight-${index}`,
        source: "knowledge-graph" as const,
        label: highlight,
        detail: "Entidade mapeada no grafo de conhecimento.",
        weight: 0.6,
      })),
    ];
  }

  private extractTopFactors(dimensions: HealthScore[], context: HealthCalculationContext): string[] {
    const factors = dimensions
      .filter((score) => !score.incomplete && score.evidence.length > 0)
      .flatMap((score) => score.evidence.slice(0, 1).map((item) => item.label));

    if (context.discovery) {
      factors.unshift(`Discovery ${context.discovery.profile.completenessScore}% completo`);
    }

    return [...new Set(factors)].slice(0, 5);
  }
}

export type CompanyHealthScoresLookup = Partial<Record<HealthDimension, number>> & {
  overall?: number | null;
};

export type HealthCalculatorResult = {
  overall: HealthScore;
  dimensions: HealthScore[];
  topFactors: string[];
  criticalDimensions: HealthDimension[];
};

export class HealthTrendAnalyzer {
  analyze(current: HealthScore[], previous: HealthScore[] | null): HealthTrend[] {
    if (!previous) {
      return current
        .filter((score) => score.dimension !== "overall")
        .map((score) => ({
          dimension: score.dimension,
          direction: "flat" as const,
          delta: 0,
          periodLabel: "Primeira medição",
        }));
    }

    const previousIndex = new Map(previous.map((score) => [score.dimension, score]));

    return current.map((score) => {
      const prior = previousIndex.get(score.dimension);
      const delta = prior ? score.value - prior.value : score.variation ?? 0;

      return {
        dimension: score.dimension,
        direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
        delta,
        periodLabel: "Última recalculação",
      };
    });
  }
}

export const healthCalculator = new HealthCalculator();
export const healthTrendAnalyzer = new HealthTrendAnalyzer();
