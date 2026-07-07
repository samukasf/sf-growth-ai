import type { AuditEntry, AuditResult } from "../entities";

export type AuditInput = {
  organizationId: string;
  actorId: string;
  actorName: string;
  module: string;
  action: string;
  description: string;
  result: AuditResult;
  metadata?: Record<string, string>;
};

export interface AuditService {
  record(input: AuditInput): Promise<AuditEntry>;
  findByOrganization(organizationId: string): Promise<AuditEntry[]>;
}
