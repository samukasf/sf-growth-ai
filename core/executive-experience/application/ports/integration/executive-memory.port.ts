import type { ExecutiveExperience } from "../../../domain";

export type ExecutiveMemoryExperienceSyncPayload = {
  companyId: string;
  experience: ReturnType<ExecutiveExperience["toJSON"]>;
  syncReason: "recorded" | "validated" | "success" | "failure";
};

export interface ExecutiveMemoryPort {
  syncExperience(payload: ExecutiveMemoryExperienceSyncPayload): Promise<void>;
}
