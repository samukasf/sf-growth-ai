import type { BusinessScenario, ExecutiveExperience } from "../entities";

export type ScenarioMatch = {
  scenario: BusinessScenario;
  experience: ExecutiveExperience;
  score: number;
  reason: string;
};

export interface ScenarioMatcher {
  match(
    target: ExecutiveExperience,
    candidates: ExecutiveExperience[],
  ): ScenarioMatch[];
}
