import type {
  ExecutiveMemoryPort,
  ExecutiveMemoryWisdomSyncPayload,
} from "../../application";

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  async syncWisdom(payload: ExecutiveMemoryWisdomSyncPayload): Promise<void> {
    void payload;
  }
}
