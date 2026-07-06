import type { ExecutiveMemoryPort, ExecutiveMemorySyncPayload } from "../../application";

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  async syncKnowledge(payload: ExecutiveMemorySyncPayload): Promise<void> {
    void payload;
  }
}
