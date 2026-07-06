import type { ExecutiveExperience, FailureCase } from "../entities";

export type FailureAnalysis = {
  experienceId: string;
  isFailure: boolean;
  rootCause: string;
  recurring: boolean;
  severity: number;
  prevention: string;
};

export interface FailureAnalyzer {
  analyze(experience: ExecutiveExperience): FailureAnalysis;
  toFailureCase(experience: ExecutiveExperience, recurring: boolean): FailureCase;
}
