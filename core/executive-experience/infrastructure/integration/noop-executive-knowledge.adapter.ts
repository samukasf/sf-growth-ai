import type { ExecutiveKnowledgePort } from "../../application";
import type { ExecutiveExperience } from "../../domain";

export class NoopExecutiveKnowledgeAdapter implements ExecutiveKnowledgePort {
  async linkExperienceToKnowledge(experience: ExecutiveExperience): Promise<void> {
    void experience;
  }
}
