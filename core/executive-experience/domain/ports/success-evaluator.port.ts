import type { ExecutiveExperience, SuccessCase } from "../entities";

export type SuccessEvaluation = {
  experienceId: string;
  isSuccess: boolean;
  successLevel: number;
  reusableSolution: string;
  bestPractice: string;
};

export interface SuccessEvaluator {
  evaluate(experience: ExecutiveExperience): SuccessEvaluation;
  toSuccessCase(experience: ExecutiveExperience): SuccessCase;
}
