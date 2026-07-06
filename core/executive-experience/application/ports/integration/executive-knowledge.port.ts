import type { ExecutiveExperience } from "../../../domain";

export interface ExecutiveKnowledgePort {
  linkExperienceToKnowledge(experience: ExecutiveExperience): Promise<void>;
}
