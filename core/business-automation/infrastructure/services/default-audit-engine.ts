import { AutomationLog, type AuditEngine } from "../../domain";

export class DefaultAuditEngine implements AuditEngine {
  private readonly logs: AutomationLog[] = [];

  record(entry: {
    executionId: string;
    organizationId: string;
    module: string;
    message: string;
    metadata: Record<string, string>;
  }) {
    const log = AutomationLog.create({
      organizationId: entry.organizationId,
      executionId: entry.executionId,
      level: "info",
      message: entry.message,
      module: entry.module,
      metadata: entry.metadata,
    });
    this.logs.push(log);
    return log;
  }

  findByExecution(executionId: string) {
    return this.logs.filter((l) => l.executionId === executionId);
  }
}
