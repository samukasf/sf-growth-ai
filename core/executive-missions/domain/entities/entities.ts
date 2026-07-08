import type {
  CompanyId,
  ExecutiveMissionId,
  MissionAlertId,
  MissionCategoryId,
  MissionCategoryKey,
  MissionExecutionId,
  MissionFrequency,
  MissionObjectiveId,
  MissionPriorityId,
  MissionPriorityLevel,
  MissionRecommendationId,
  MissionResultId,
  MissionScheduleId,
  MissionStatusKey,
  OrganizationId,
} from "../../shared";
import { clampMoney, clampScore } from "../../shared";

export type MissionCategoryProps = {
  id: MissionCategoryId;
  key: MissionCategoryKey;
  label: string;
  description: string;
};

export class MissionCategory {
  readonly id: MissionCategoryId;
  readonly key: MissionCategoryKey;
  readonly label: string;
  readonly description: string;

  private constructor(props: MissionCategoryProps) {
    this.id = props.id;
    this.key = props.key;
    this.label = props.label;
    this.description = props.description;
  }

  static create(props: Omit<MissionCategoryProps, "id"> & { id?: MissionCategoryId }): MissionCategory {
    return new MissionCategory({
      id: props.id ?? `mcat-${props.key}`,
      key: props.key,
      label: props.label,
      description: props.description,
    });
  }

  toJSON(): MissionCategoryProps {
    return {
      id: this.id,
      key: this.key,
      label: this.label,
      description: this.description,
    };
  }
}

export type MissionObjectiveProps = {
  id: MissionObjectiveId;
  title: string;
  description: string;
  successCriteria: string[];
};

export class MissionObjective {
  readonly id: MissionObjectiveId;
  readonly title: string;
  readonly description: string;
  readonly successCriteria: string[];

  private constructor(props: MissionObjectiveProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.successCriteria = props.successCriteria;
  }

  static create(
    props: Omit<MissionObjectiveProps, "id"> & { id?: MissionObjectiveId },
  ): MissionObjective {
    if (!props.title.trim()) throw new Error("objective.title is required");
    return new MissionObjective({
      id: props.id ?? `obj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: props.title,
      description: props.description,
      successCriteria: props.successCriteria,
    });
  }

  toJSON(): MissionObjectiveProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      successCriteria: this.successCriteria,
    };
  }
}

export type MissionPriorityProps = {
  id: MissionPriorityId;
  level: MissionPriorityLevel;
  score: number;
  rationale: string;
};

export class MissionPriority {
  readonly id: MissionPriorityId;
  readonly level: MissionPriorityLevel;
  readonly score: number;
  readonly rationale: string;

  private constructor(props: MissionPriorityProps) {
    this.id = props.id;
    this.level = props.level;
    this.score = props.score;
    this.rationale = props.rationale;
  }

  static create(
    props: Omit<MissionPriorityProps, "id" | "score"> & { id?: MissionPriorityId; score?: number },
  ): MissionPriority {
    return new MissionPriority({
      id: props.id ?? `mpr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level: props.level,
      score: clampScore(props.score ?? 50),
      rationale: props.rationale,
    });
  }

  toJSON(): MissionPriorityProps {
    return {
      id: this.id,
      level: this.level,
      score: this.score,
      rationale: this.rationale,
    };
  }
}

export type MissionScheduleProps = {
  id: MissionScheduleId;
  frequency: MissionFrequency;
  cron?: string;
  timezone?: string;
  nextRunAt?: string;
  lastRunAt?: string;
};

export class MissionSchedule {
  readonly id: MissionScheduleId;
  readonly frequency: MissionFrequency;
  readonly cron?: string;
  readonly timezone?: string;
  readonly nextRunAt?: string;
  readonly lastRunAt?: string;

  private constructor(props: MissionScheduleProps) {
    this.id = props.id;
    this.frequency = props.frequency;
    this.cron = props.cron;
    this.timezone = props.timezone;
    this.nextRunAt = props.nextRunAt;
    this.lastRunAt = props.lastRunAt;
  }

  static create(
    props: Omit<MissionScheduleProps, "id"> & { id?: MissionScheduleId },
  ): MissionSchedule {
    return new MissionSchedule({
      id: props.id ?? `msched-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      frequency: props.frequency,
      cron: props.cron,
      timezone: props.timezone,
      nextRunAt: props.nextRunAt,
      lastRunAt: props.lastRunAt,
    });
  }

  withNextRun(nextRunAt: string): MissionSchedule {
    return MissionSchedule.create({ ...this.toJSON(), nextRunAt });
  }

  withLastRun(lastRunAt: string): MissionSchedule {
    return MissionSchedule.create({ ...this.toJSON(), lastRunAt });
  }

  toJSON(): MissionScheduleProps {
    return {
      id: this.id,
      frequency: this.frequency,
      cron: this.cron,
      timezone: this.timezone,
      nextRunAt: this.nextRunAt,
      lastRunAt: this.lastRunAt,
    };
  }
}

export type MissionStatusProps = {
  key: MissionStatusKey;
  reason?: string;
  updatedAt: string;
};

export class MissionStatus {
  readonly key: MissionStatusKey;
  readonly reason?: string;
  readonly updatedAt: string;

  private constructor(props: MissionStatusProps) {
    this.key = props.key;
    this.reason = props.reason;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<MissionStatusProps, "updatedAt"> & { updatedAt?: string }): MissionStatus {
    return new MissionStatus({
      key: props.key,
      reason: props.reason,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MissionStatusProps {
    return { key: this.key, reason: this.reason, updatedAt: this.updatedAt };
  }
}

export type ExecutiveMissionProps = {
  id: ExecutiveMissionId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  title: string;
  description: string;
  category: MissionCategoryKey;
  objective: ReturnType<MissionObjective["toJSON"]>;
  priority: MissionPriorityLevel;
  frequency: MissionFrequency;
  owner: string;
  status: MissionStatusKey;
  expectedImpact: number;
  estimatedROI: number;
  relatedDepartments: string[];
  createdAt: string;
  updatedAt: string;
};

export class ExecutiveMission {
  readonly id: ExecutiveMissionId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly description: string;
  readonly category: MissionCategoryKey;
  readonly objective: MissionObjective;
  readonly priority: MissionPriorityLevel;
  readonly frequency: MissionFrequency;
  readonly owner: string;
  readonly status: MissionStatusKey;
  readonly expectedImpact: number;
  readonly estimatedROI: number;
  readonly relatedDepartments: string[];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ExecutiveMissionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.objective = MissionObjective.create(props.objective);
    this.priority = props.priority;
    this.frequency = props.frequency;
    this.owner = props.owner;
    this.status = props.status;
    this.expectedImpact = props.expectedImpact;
    this.estimatedROI = props.estimatedROI;
    this.relatedDepartments = props.relatedDepartments;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ExecutiveMissionProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: ExecutiveMissionId;
      createdAt?: string;
      updatedAt?: string;
      status?: MissionStatusKey;
    },
  ): ExecutiveMission {
    if (!props.title.trim()) throw new Error("mission.title is required");
    const now = new Date().toISOString();
    return new ExecutiveMission({
      id: props.id ?? `msn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      title: props.title,
      description: props.description,
      category: props.category,
      objective: props.objective,
      priority: props.priority,
      frequency: props.frequency,
      owner: props.owner,
      status: props.status ?? "created",
      expectedImpact: clampScore(props.expectedImpact),
      estimatedROI: clampMoney(props.estimatedROI),
      relatedDepartments: props.relatedDepartments,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: MissionStatusKey): ExecutiveMission {
    return ExecutiveMission.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveMissionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      title: this.title,
      description: this.description,
      category: this.category,
      objective: this.objective.toJSON(),
      priority: this.priority,
      frequency: this.frequency,
      owner: this.owner,
      status: this.status,
      expectedImpact: this.expectedImpact,
      estimatedROI: this.estimatedROI,
      relatedDepartments: this.relatedDepartments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type MissionExecutionProps = {
  id: MissionExecutionId;
  missionId: ExecutiveMissionId;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "failed";
  logs: string[];
  context?: Record<string, unknown>;
};

export class MissionExecution {
  readonly id: MissionExecutionId;
  readonly missionId: ExecutiveMissionId;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly status: "running" | "completed" | "failed";
  readonly logs: string[];
  readonly context?: Record<string, unknown>;

  private constructor(props: MissionExecutionProps) {
    this.id = props.id;
    this.missionId = props.missionId;
    this.startedAt = props.startedAt;
    this.finishedAt = props.finishedAt;
    this.status = props.status;
    this.logs = props.logs;
    this.context = props.context;
  }

  static create(
    props: Omit<MissionExecutionProps, "id" | "startedAt" | "status"> & {
      id?: MissionExecutionId;
      startedAt?: string;
      status?: "running" | "completed" | "failed";
    },
  ): MissionExecution {
    return new MissionExecution({
      id: props.id ?? `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      missionId: props.missionId,
      startedAt: props.startedAt ?? new Date().toISOString(),
      finishedAt: props.finishedAt,
      status: props.status ?? "running",
      logs: props.logs,
      context: props.context,
    });
  }

  complete(log: string): MissionExecution {
    return MissionExecution.create({
      ...this.toJSON(),
      status: "completed",
      finishedAt: new Date().toISOString(),
      logs: [...this.logs, log],
    });
  }

  fail(log: string): MissionExecution {
    return MissionExecution.create({
      ...this.toJSON(),
      status: "failed",
      finishedAt: new Date().toISOString(),
      logs: [...this.logs, log],
    });
  }

  toJSON(): MissionExecutionProps {
    return {
      id: this.id,
      missionId: this.missionId,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      status: this.status,
      logs: this.logs,
      context: this.context,
    };
  }
}

export type MissionResultProps = {
  id: MissionResultId;
  missionId: ExecutiveMissionId;
  executionId: MissionExecutionId;
  summary: string;
  findings: string[];
  estimatedROI: number;
  impactScore: number;
  createdAt: string;
};

export class MissionResult {
  readonly id: MissionResultId;
  readonly missionId: ExecutiveMissionId;
  readonly executionId: MissionExecutionId;
  readonly summary: string;
  readonly findings: string[];
  readonly estimatedROI: number;
  readonly impactScore: number;
  readonly createdAt: string;

  private constructor(props: MissionResultProps) {
    this.id = props.id;
    this.missionId = props.missionId;
    this.executionId = props.executionId;
    this.summary = props.summary;
    this.findings = props.findings;
    this.estimatedROI = props.estimatedROI;
    this.impactScore = props.impactScore;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<MissionResultProps, "id" | "createdAt"> & { id?: MissionResultId; createdAt?: string },
  ): MissionResult {
    return new MissionResult({
      id: props.id ?? `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      missionId: props.missionId,
      executionId: props.executionId,
      summary: props.summary,
      findings: props.findings,
      estimatedROI: clampMoney(props.estimatedROI),
      impactScore: clampScore(props.impactScore),
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MissionResultProps {
    return {
      id: this.id,
      missionId: this.missionId,
      executionId: this.executionId,
      summary: this.summary,
      findings: this.findings,
      estimatedROI: this.estimatedROI,
      impactScore: this.impactScore,
      createdAt: this.createdAt,
    };
  }
}

export type MissionAlertProps = {
  id: MissionAlertId;
  missionId: ExecutiveMissionId;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  generatedAt: string;
};

export class MissionAlert {
  readonly id: MissionAlertId;
  readonly missionId: ExecutiveMissionId;
  readonly severity: "info" | "warning" | "critical";
  readonly title: string;
  readonly description: string;
  readonly generatedAt: string;

  private constructor(props: MissionAlertProps) {
    this.id = props.id;
    this.missionId = props.missionId;
    this.severity = props.severity;
    this.title = props.title;
    this.description = props.description;
    this.generatedAt = props.generatedAt;
  }

  static create(
    props: Omit<MissionAlertProps, "id" | "generatedAt"> & { id?: MissionAlertId; generatedAt?: string },
  ): MissionAlert {
    return new MissionAlert({
      id: props.id ?? `alt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      missionId: props.missionId,
      severity: props.severity,
      title: props.title,
      description: props.description,
      generatedAt: props.generatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MissionAlertProps {
    return {
      id: this.id,
      missionId: this.missionId,
      severity: this.severity,
      title: this.title,
      description: this.description,
      generatedAt: this.generatedAt,
    };
  }
}

export type MissionRecommendationProps = {
  id: MissionRecommendationId;
  missionId: ExecutiveMissionId;
  title: string;
  description: string;
  department: string;
  order: number;
  expectedOutcome: string;
};

export class MissionRecommendation {
  readonly id: MissionRecommendationId;
  readonly missionId: ExecutiveMissionId;
  readonly title: string;
  readonly description: string;
  readonly department: string;
  readonly order: number;
  readonly expectedOutcome: string;

  private constructor(props: MissionRecommendationProps) {
    this.id = props.id;
    this.missionId = props.missionId;
    this.title = props.title;
    this.description = props.description;
    this.department = props.department;
    this.order = props.order;
    this.expectedOutcome = props.expectedOutcome;
  }

  static create(
    props: Omit<MissionRecommendationProps, "id"> & { id?: MissionRecommendationId },
  ): MissionRecommendation {
    return new MissionRecommendation({
      id: props.id ?? `mrec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      missionId: props.missionId,
      title: props.title,
      description: props.description,
      department: props.department,
      order: props.order,
      expectedOutcome: props.expectedOutcome,
    });
  }

  toJSON(): MissionRecommendationProps {
    return {
      id: this.id,
      missionId: this.missionId,
      title: this.title,
      description: this.description,
      department: this.department,
      order: this.order,
      expectedOutcome: this.expectedOutcome,
    };
  }
}

