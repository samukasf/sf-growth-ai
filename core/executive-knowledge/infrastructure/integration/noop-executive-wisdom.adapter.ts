import type {
  ExecutiveWisdomCandidate,
  ExecutiveWisdomPort,
} from "../../application";
import type { KnowledgeRecord } from "../../domain";

export class NoopExecutiveWisdomAdapter implements ExecutiveWisdomPort {
  async evaluateForWisdom(record: KnowledgeRecord): Promise<ExecutiveWisdomCandidate | null> {
    void record;
    return null;
  }

  async registerWisdomCandidate(candidate: ExecutiveWisdomCandidate): Promise<void> {
    void candidate;
  }
}
