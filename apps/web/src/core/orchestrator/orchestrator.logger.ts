import type {
  OrchestratorLoggerPort,
  PipelineStep,
  PipelineStepName,
  PipelineStepStatus,
  StructuredLogEntry,
} from "./orchestrator.types";

export class OrchestratorLogger implements OrchestratorLoggerPort {
  private readonly entries: StructuredLogEntry[] = [];

  log(entry: StructuredLogEntry): void {
    this.entries.push(entry);
  }

  logStep(
    step: PipelineStepName,
    status: PipelineStepStatus,
    durationMs: number,
    result: Record<string, unknown>,
    context: { tenantId: string; companyId: string },
    error?: string,
  ): void {
    const level = status === "failed" ? "error" : "info";
    this.log({
      level,
      step,
      message: `Pipeline step ${step} ${status}`,
      durationMs,
      status,
      result,
      tenantId: context.tenantId,
      companyId: context.companyId,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      this.log({
        level: "error",
        step,
        message: error,
        durationMs,
        status: "failed",
        tenantId: context.tenantId,
        companyId: context.companyId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  getEntries(): StructuredLogEntry[] {
    return [...this.entries];
  }

  getStepsFromEntries(): PipelineStep[] {
    return this.entries
      .filter((entry) => entry.step && entry.status && entry.status !== "pending")
      .map((entry) => ({
        name: entry.step!,
        status: entry.status!,
        durationMs: entry.durationMs ?? 0,
        result: entry.result ?? {},
      }));
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export function createOrchestratorLogger(): OrchestratorLogger {
  return new OrchestratorLogger();
}
