import type { ExecutivePlaybook, ExecutiveWisdom } from "../entities";

export interface PlaybookGenerator {
  generate(wisdom: ExecutiveWisdom): ExecutivePlaybook;
}
