import type {
  ExecutiveMemoryExperienceSyncPayload,
  ExecutiveMemoryPort,
} from "../../application";

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  async syncExperience(payload: ExecutiveMemoryExperienceSyncPayload): Promise<void> {
    void payload;
  }
}
