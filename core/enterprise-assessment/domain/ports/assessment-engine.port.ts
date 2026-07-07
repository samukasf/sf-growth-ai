import type {
  Assessment,
  AssessmentAnswer,
  AssessmentBenchmark,
  AssessmentDimension,
  AssessmentRecommendation,
  AssessmentRoadmap,
  AssessmentScore,
} from "../entities";
import type { AssessmentId, CompanyId } from "../../shared";

export type StartAssessmentInput = {
  organizationId: string;
  companyId: string;
  companyName: string;
  initiatedBy: string;
  discoverySessionId?: string;
  industry?: string;
  context?: Record<string, unknown>;
};

export type StartAssessmentResult = {
  assessment: Assessment;
};

export type RunAssessmentInput = {
  assessmentId: AssessmentId;
  answers?: AssessmentAnswer[];
  industry?: string;
  context?: Record<string, unknown>;
};

export type AssessmentResult = {
  assessment: ReturnType<Assessment["toJSON"]>;
  dimensions: ReturnType<AssessmentDimension["toJSON"]>[];
  score: ReturnType<AssessmentScore["toJSON"]>;
  benchmark: ReturnType<AssessmentBenchmark["toJSON"]>;
  recommendations: ReturnType<AssessmentRecommendation["toJSON"]>[];
  roadmap: ReturnType<AssessmentRoadmap["toJSON"]>;
  summary: string;
};

export type RunAssessmentResult = AssessmentResult;

export interface AssessmentEngine {
  startAssessment(input: StartAssessmentInput): Promise<StartAssessmentResult>;
  runAssessment(input: RunAssessmentInput): Promise<RunAssessmentResult>;
  getResult(assessmentId: AssessmentId): Promise<AssessmentResult | null>;
  getLatestByCompany(companyId: CompanyId): Promise<AssessmentResult | null>;
}
