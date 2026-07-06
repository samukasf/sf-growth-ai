import type { ExecutiveLearningPort } from "../../application";
import type { ExecutiveExperience } from "../../domain";

export class NoopExecutiveLearningAdapter implements ExecutiveLearningPort {
  async feedFromExperience(experience: ExecutiveExperience): Promise<void> {
    void experience;
  }
}
