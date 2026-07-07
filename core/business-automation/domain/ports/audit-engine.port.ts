import type { AutomationLog } from "../entities";

export type AuditEntry = {
  executionId: string;
  organizationId: string;
  module: string;
  message: string;
  metadata: Record<string, string>;
};

export interface AuditEngine {
  record(entry: AuditEntry): AutomationLog;
  findByExecution(executionId: string): AutomationLog[];
}
