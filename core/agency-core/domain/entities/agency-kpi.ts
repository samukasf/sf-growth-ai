import type { AgencyGoalId, AgencyId, AgencyKpiId, AgencyKpiStatus, OrganizationId } from "../../shared";

export type AgencyKPIProps = {
  id: AgencyKpiId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  goalId?: AgencyGoalId;
  name: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  status: AgencyKpiStatus;
  updatedAt: string;
};

export class AgencyKPI {
  readonly id: AgencyKpiId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly goalId?: AgencyGoalId;
  readonly name: string;
  readonly unit: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly status: AgencyKpiStatus;
  readonly updatedAt: string;

  private constructor(props: AgencyKPIProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.goalId = props.goalId;
    this.name = props.name;
    this.unit = props.unit;
    this.targetValue = props.targetValue;
    this.currentValue = props.currentValue;
    this.status = props.status;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AgencyKPIProps, "id" | "updatedAt" | "status" | "currentValue"> & {
      id?: AgencyKpiId;
      status?: AgencyKpiStatus;
      currentValue?: number;
      updatedAt?: string;
    },
  ): AgencyKPI {
    const currentValue = props.currentValue ?? 0;
    return new AgencyKPI({
      id: props.id ?? `akpi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      goalId: props.goalId,
      name: props.name.trim(),
      unit: props.unit,
      targetValue: props.targetValue,
      currentValue,
      status: props.status ?? AgencyKPI.resolveStatus(currentValue, props.targetValue),
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  static resolveStatus(currentValue: number, targetValue: number): AgencyKpiStatus {
    const ratio = targetValue === 0 ? 1 : currentValue / targetValue;
    if (ratio >= 0.85) return "on_track";
    if (ratio >= 0.6) return "at_risk";
    return "off_track";
  }

  updateValue(currentValue: number): AgencyKPI {
    return AgencyKPI.create({
      ...this.toJSON(),
      currentValue,
      status: AgencyKPI.resolveStatus(currentValue, this.targetValue),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): AgencyKPIProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      goalId: this.goalId,
      name: this.name,
      unit: this.unit,
      targetValue: this.targetValue,
      currentValue: this.currentValue,
      status: this.status,
      updatedAt: this.updatedAt,
    };
  }
}
