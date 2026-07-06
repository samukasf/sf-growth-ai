import type {
  ExecutiveMemoryLearningSyncPayload,
  ExecutiveMemoryPort,
} from "../../application";

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  async syncLearning(payload: ExecutiveMemoryLearningSyncPayload): Promise<void> {
    void payload;
  }
}
