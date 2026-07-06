import type { LearningRecord } from "../../../domain";

export type ExecutiveMemoryLearningSyncPayload = {
  companyId: string;
  record: ReturnType<LearningRecord["toJSON"]>;
  syncReason: "created" | "updated" | "validated" | "pattern_detected";
};

export interface ExecutiveMemoryPort {
  syncLearning(payload: ExecutiveMemoryLearningSyncPayload): Promise<void>;
}
