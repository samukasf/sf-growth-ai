import type { AgencyGoalId, AgencyGoalStatus, AgencyId, OrganizationId } from "../../shared";

export type AgencyGoalProps = {
  id: AgencyGoalId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  title: string;
  targetValue: number;
  currentValue: number;
  status: AgencyGoalStatus;
  dueDate: string;
  createdAt: string;
};

export class AgencyGoal {
  readonly id: AgencyGoalId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly title: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly status: AgencyGoalStatus;
  readonly dueDate: string;
  readonly createdAt: string;

  private constructor(props: AgencyGoalProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.title = props.title;
    this.targetValue = props.targetValue;
    this.currentValue = props.currentValue;
    this.status = props.status;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyGoalProps, "id" | "createdAt" | "status" | "currentValue"> & {
      id?: AgencyGoalId;
      status?: AgencyGoalStatus;
      currentValue?: number;
      createdAt?: string;
    },
  ): AgencyGoal {
    return new AgencyGoal({
      id: props.id ?? `agoal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      title: props.title.trim(),
      targetValue: props.targetValue,
      currentValue: props.currentValue ?? 0,
      status: props.status ?? "planned",
      dueDate: props.dueDate,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyGoalProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      title: this.title,
      targetValue: this.targetValue,
      currentValue: this.currentValue,
      status: this.status,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
    };
  }
}
