import {
  AssessmentBenchmark,
  type BenchmarkEngine,
  type BenchmarkInput,
} from "../../domain";

const INDUSTRY_AVERAGES: Record<string, number> = {
  default: 52,
  comunicacao_visual: 48,
  tecnologia: 58,
  servicos: 50,
  industria: 46,
};

export class DefaultBenchmarkEngine implements BenchmarkEngine {
  benchmark(input: BenchmarkInput): AssessmentBenchmark {
    const industryAvg = INDUSTRY_AVERAGES[input.industry] ?? INDUSTRY_AVERAGES.default;

    const entries = input.dimensions.map((dim) => {
      const industryAverage = clamp(industryAvg + (dim.key === "tecnologia" ? -5 : 0));
      const topQuartile = clamp(industryAverage + 22);
      const gap = topQuartile - dim.score;
      return {
        dimensionKey: dim.key,
        companyScore: dim.score,
        industryAverage,
        topQuartile,
        gap: Math.max(0, gap),
      };
    });

    return AssessmentBenchmark.create({
      assessmentId: input.assessmentId,
      industry: input.industry,
      entries,
    });
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
