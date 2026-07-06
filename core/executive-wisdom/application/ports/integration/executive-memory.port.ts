import type { ExecutiveWisdom } from "../../../domain";

export type ExecutiveMemoryWisdomSyncPayload = {
  companyId: string;
  wisdom: ReturnType<ExecutiveWisdom["toJSON"]>;
  syncReason: "created" | "updated" | "validated";
};

export interface ExecutiveMemoryPort {
  syncWisdom(payload: ExecutiveMemoryWisdomSyncPayload): Promise<void>;
}
