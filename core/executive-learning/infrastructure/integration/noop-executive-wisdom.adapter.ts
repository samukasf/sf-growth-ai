import type {
  ExecutiveWisdomCandidate,
  ExecutiveWisdomPort,
} from "../../application";
import type { LearningPattern, LearningRecord } from "../../domain";

export class NoopExecutiveWisdomAdapter implements ExecutiveWisdomPort {
  async evaluateForWisdom(record: LearningRecord): Promise<ExecutiveWisdomCandidate | null> {
    void record;
    return null;
  }

  async registerWisdomCandidate(candidate: ExecutiveWisdomCandidate): Promise<void> {
    void candidate;
  }

  async registerFromPattern(pattern: LearningPattern): Promise<void> {
    void pattern;
  }
}
