import type { ExecutiveExperience } from "../../../domain";

export interface ExecutiveLearningPort {
  feedFromExperience(experience: ExecutiveExperience): Promise<void>;
}
