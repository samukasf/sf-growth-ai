import type { AssessmentBenchmark, AssessmentDimension } from "../entities";
import type { AssessmentId } from "../../shared";

export type BenchmarkInput = {
  assessmentId: AssessmentId;
  industry: string;
  dimensions: AssessmentDimension[];
};

export interface BenchmarkEngine {
  benchmark(input: BenchmarkInput): AssessmentBenchmark;
}
