import type {
  ExecutiveKnowledgePort,
  ExecutiveKnowledgeReference,
} from "../../application";
import type { ExecutiveWisdom } from "../../domain";

export class NoopExecutiveKnowledgeAdapter implements ExecutiveKnowledgePort {
  async linkWisdomToKnowledge(reference: ExecutiveKnowledgeReference): Promise<void> {
    void reference;
  }

  async getRelatedKnowledgeIds(wisdom: ExecutiveWisdom): Promise<string[]> {
    return wisdom.knowledgeIds;
  }
}
