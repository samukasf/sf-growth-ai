import type { EmployeeScheduleId, OrganizationId } from "../../shared";

export type EmployeeScheduleProps = {
  id: EmployeeScheduleId;
  organizationId: OrganizationId;
  employeeId: string;
  calendarId: string;
  workingHoursIds: string[];
  active: boolean;
  createdAt: string;
};

export class EmployeeSchedule {
  readonly id: EmployeeScheduleId;
  readonly organizationId: OrganizationId;
  readonly employeeId: string;
  readonly calendarId: string;
  readonly workingHoursIds: string[];
  readonly active: boolean;
  readonly createdAt: string;

  private constructor(props: EmployeeScheduleProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.employeeId = props.employeeId;
    this.calendarId = props.calendarId;
    this.workingHoursIds = [...props.workingHoursIds];
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<EmployeeScheduleProps, "id" | "createdAt"> & {
      id?: EmployeeScheduleId;
      createdAt?: string;
    },
  ): EmployeeSchedule {
    return new EmployeeSchedule({
      id: props.id ?? `emp-sched-${Date.now()}`,
      organizationId: props.organizationId,
      employeeId: props.employeeId,
      calendarId: props.calendarId,
      workingHoursIds: props.workingHoursIds,
      active: props.active,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): EmployeeScheduleProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      employeeId: this.employeeId,
      calendarId: this.calendarId,
      workingHoursIds: [...this.workingHoursIds],
      active: this.active,
      createdAt: this.createdAt,
    };
  }
}
