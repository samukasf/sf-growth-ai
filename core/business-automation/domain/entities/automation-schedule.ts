import type {
  AutomationScheduleId,
  AutomationWorkflowId,
  OrganizationId,
} from "../../shared";

export type ScheduleFrequency = "once" | "hourly" | "daily" | "weekly" | "monthly" | "cron";

export type AutomationScheduleProps = {
  id: AutomationScheduleId;
  organizationId: OrganizationId;
  workflowId: AutomationWorkflowId;
  name: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  nextRunAt?: string;
  lastRunAt?: string;
  active: boolean;
};

export class AutomationSchedule {
  readonly id: AutomationScheduleId;
  readonly organizationId: OrganizationId;
  readonly workflowId: AutomationWorkflowId;
  readonly name: string;
  readonly frequency: ScheduleFrequency;
  readonly cronExpression?: string;
  readonly nextRunAt?: string;
  readonly lastRunAt?: string;
  readonly active: boolean;

  private constructor(props: AutomationScheduleProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.workflowId = props.workflowId;
    this.name = props.name;
    this.frequency = props.frequency;
    this.cronExpression = props.cronExpression;
    this.nextRunAt = props.nextRunAt;
    this.lastRunAt = props.lastRunAt;
    this.active = props.active;
  }

  static create(
    props: Omit<AutomationScheduleProps, "id"> & { id?: AutomationScheduleId },
  ): AutomationSchedule {
    return new AutomationSchedule({
      id: props.id ?? `schedule-${Date.now()}`,
      organizationId: props.organizationId,
      workflowId: props.workflowId,
      name: props.name.trim(),
      frequency: props.frequency,
      cronExpression: props.cronExpression,
      nextRunAt: props.nextRunAt,
      lastRunAt: props.lastRunAt,
      active: props.active,
    });
  }

  toJSON(): AutomationScheduleProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      workflowId: this.workflowId,
      name: this.name,
      frequency: this.frequency,
      cronExpression: this.cronExpression,
      nextRunAt: this.nextRunAt,
      lastRunAt: this.lastRunAt,
      active: this.active,
    };
  }
}
