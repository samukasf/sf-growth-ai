import type { KnowledgeRecord } from "../../../domain";

export type ExecutiveMemorySyncPayload = {
  companyId: string;
  record: ReturnType<KnowledgeRecord["toJSON"]>;
  syncReason: "created" | "updated" | "validated" | "archived";
};

export interface ExecutiveMemoryPort {
  syncKnowledge(payload: ExecutiveMemorySyncPayload): Promise<void>;
}
