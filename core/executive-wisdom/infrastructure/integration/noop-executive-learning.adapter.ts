import type {
  ExecutiveLearningPort,
  ExecutiveLearningReference,
} from "../../application";
import type { ExecutiveWisdom } from "../../domain";

export class NoopExecutiveLearningAdapter implements ExecutiveLearningPort {
  async linkWisdomToLearning(reference: ExecutiveLearningReference): Promise<void> {
    void reference;
  }

  async getRelatedLearningIds(wisdom: ExecutiveWisdom): Promise<string[]> {
    return wisdom.learningIds;
  }
}
