import type { CompanyHealth, HealthPresentation } from "./health.types";
import { HEALTH_DIMENSION_LABELS } from "./health.types";
import type { CompanyHealthService } from "./health.service";

export function presentCompanyHealth(
  health: CompanyHealth,
  trends: Awaited<ReturnType<CompanyHealthService["getTrends"]>>,
  recommendations: Awaited<ReturnType<CompanyHealthService["getRecommendations"]>>,
): HealthPresentation {
  return {
    overall: {
      value: health.overall.value,
      status: health.overall.status,
      confidence: health.overall.confidence,
      variation: health.overall.variation,
      label: HEALTH_DIMENSION_LABELS.overall,
    },
    dimensions: health.dimensions.map((score) => ({
      dimension: score.dimension,
      label: HEALTH_DIMENSION_LABELS[score.dimension],
      value: score.value,
      previousValue: score.previousValue,
      variation: score.variation,
      status: score.status,
      confidence: score.confidence,
      incomplete: score.incomplete,
      topEvidence: score.evidence.slice(0, 2).map((item) => item.label),
    })),
    topFactors: health.topFactors,
    criticalDimensions: health.criticalDimensions.map((dimension) => {
      const score = health.dimensions.find((item) => item.dimension === dimension);
      return {
        dimension,
        label: HEALTH_DIMENSION_LABELS[dimension],
        value: score?.value ?? health.overall.value,
      };
    }),
    recommendations,
    trends,
  };
}

export async function presentCompanyHealthForViewer(
  service: CompanyHealthService,
  companyId: string,
): Promise<HealthPresentation | null> {
  const health = await service.getLatest(companyId);
  if (!health) return null;

  const trends = await service.getTrends(companyId);
  const recommendations = await service.getRecommendations(companyId);

  return presentCompanyHealth(health, trends, recommendations);
}
