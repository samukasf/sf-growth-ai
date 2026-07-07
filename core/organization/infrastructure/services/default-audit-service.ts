import { AuditEntry, type AuditInput, type AuditService } from "../../domain";
import type { OrganizationRepository } from "../../domain";

export class DefaultAuditService implements AuditService {
  constructor(private readonly repository: OrganizationRepository) {}

  async record(input: AuditInput): Promise<AuditEntry> {
    const entry = AuditEntry.create({
      organizationId: input.organizationId,
      actorId: input.actorId,
      actorName: input.actorName,
      module: input.module,
      action: input.action,
      description: input.description,
      result: input.result,
      metadata: input.metadata ?? {},
    });

    await this.repository.saveAuditEntry(entry);
    return entry;
  }

  async findByOrganization(organizationId: string): Promise<AuditEntry[]> {
    return this.repository.findAuditEntries(organizationId);
  }
}
