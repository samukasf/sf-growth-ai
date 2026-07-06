import type { ExecutiveWisdomPort } from "../../application";
import type { ExecutiveExperience } from "../../domain";

export class NoopExecutiveWisdomAdapter implements ExecutiveWisdomPort {
  async enrichFromExperience(experience: ExecutiveExperience): Promise<void> {
    void experience;
  }
}
