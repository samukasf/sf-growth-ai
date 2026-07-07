import {
  Automation,
  AutomationApproval,
  AutomationExecution,
  AutomationLog,
  AutomationResult,
  AutomationSchedule,
  type AutomationRepository,
} from "../../domain";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

function deserializeAutomation(raw: string): Automation {
  return Automation.create(JSON.parse(raw) as ReturnType<Automation["toJSON"]>);
}

function deserializeExecution(raw: string): AutomationExecution {
  return AutomationExecution.create(
    JSON.parse(raw) as ReturnType<AutomationExecution["toJSON"]>,
  );
}

function deserializeApproval(raw: string): AutomationApproval {
  return AutomationApproval.create(JSON.parse(raw) as ReturnType<AutomationApproval["toJSON"]>);
}

function deserializeSchedule(raw: string): AutomationSchedule {
  return AutomationSchedule.create(JSON.parse(raw) as ReturnType<AutomationSchedule["toJSON"]>);
}

function deserializeResult(raw: string): AutomationResult {
  return AutomationResult.create(JSON.parse(raw) as ReturnType<AutomationResult["toJSON"]>);
}

export class InMemoryAutomationRepository implements AutomationRepository {
  private readonly automations = new Map<string, string>();
  private readonly executions = new Map<string, string>();
  private readonly logs: AutomationLog[] = [];
  private readonly approvals = new Map<string, string>();
  private readonly schedules = new Map<string, string>();
  private readonly results = new Map<string, string>();

  async save(automation: Automation): Promise<void> {
    this.automations.set(automation.id, serialize(automation.toJSON()));
  }

  async findById(id: string): Promise<Automation | null> {
    const raw = this.automations.get(id);
    return raw ? deserializeAutomation(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Automation[]> {
    const results: Automation[] = [];
    for (const raw of this.automations.values()) {
      const automation = deserializeAutomation(raw);
      if (automation.organizationId === organizationId) results.push(automation);
    }
    return results;
  }

  async saveExecution(execution: AutomationExecution): Promise<void> {
    this.executions.set(execution.id, serialize(execution.toJSON()));
  }

  async findExecutionById(id: string): Promise<AutomationExecution | null> {
    const raw = this.executions.get(id);
    return raw ? deserializeExecution(raw) : null;
  }

  async findExecutionsByAutomation(automationId: string): Promise<AutomationExecution[]> {
    const results: AutomationExecution[] = [];
    for (const raw of this.executions.values()) {
      const execution = deserializeExecution(raw);
      if (execution.automationId === automationId) results.push(execution);
    }
    return results;
  }

  async saveLog(log: AutomationLog): Promise<void> {
    this.logs.push(log);
  }

  async findLogsByExecution(executionId: string): Promise<AutomationLog[]> {
    return this.logs.filter((l) => l.executionId === executionId);
  }

  async saveApproval(approval: AutomationApproval): Promise<void> {
    this.approvals.set(approval.id, serialize(approval.toJSON()));
  }

  async findApprovalById(id: string): Promise<AutomationApproval | null> {
    const raw = this.approvals.get(id);
    return raw ? deserializeApproval(raw) : null;
  }

  async saveSchedule(schedule: AutomationSchedule): Promise<void> {
    this.schedules.set(schedule.id, serialize(schedule.toJSON()));
  }

  async findSchedulesByOrganization(organizationId: string): Promise<AutomationSchedule[]> {
    const results: AutomationSchedule[] = [];
    for (const raw of this.schedules.values()) {
      const schedule = deserializeSchedule(raw);
      if (schedule.organizationId === organizationId) results.push(schedule);
    }
    return results;
  }

  async saveResult(result: AutomationResult): Promise<void> {
    this.results.set(result.executionId, serialize(result.toJSON()));
  }

  async findResultByExecution(executionId: string): Promise<AutomationResult | null> {
    const raw = this.results.get(executionId);
    return raw ? deserializeResult(raw) : null;
  }
}
