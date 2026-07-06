import type { ExecutiveExperience } from "../../../domain";

export interface ExecutiveWisdomPort {
  enrichFromExperience(experience: ExecutiveExperience): Promise<void>;
}
