import type { CalendarId, OrganizationId, ScheduleId } from "../../shared";

export type ScheduleStatus = "active" | "paused" | "archived";

export type ScheduleProps = {
  id: ScheduleId;
  organizationId: OrganizationId;
  calendarId: CalendarId;
  name: string;
  description: string;
  status: ScheduleStatus;
  slotDurationMinutes: number;
  bufferMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export class Schedule {
  readonly id: ScheduleId;
  readonly organizationId: OrganizationId;
  readonly calendarId: CalendarId;
  readonly name: string;
  readonly description: string;
  readonly status: ScheduleStatus;
  readonly slotDurationMinutes: number;
  readonly bufferMinutes: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ScheduleProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.calendarId = props.calendarId;
    this.name = props.name;
    this.description = props.description;
    this.status = props.status;
    this.slotDurationMinutes = props.slotDurationMinutes;
    this.bufferMinutes = props.bufferMinutes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ScheduleProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: ScheduleId;
      createdAt?: string;
      updatedAt?: string;
      status?: ScheduleStatus;
    },
  ): Schedule {
    const now = new Date().toISOString();
    return new Schedule({
      id: props.id ?? `schedule-${Date.now()}`,
      organizationId: props.organizationId,
      calendarId: props.calendarId,
      name: props.name.trim(),
      description: props.description.trim(),
      status: props.status ?? "active",
      slotDurationMinutes: props.slotDurationMinutes,
      bufferMinutes: props.bufferMinutes,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): ScheduleProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      calendarId: this.calendarId,
      name: this.name,
      description: this.description,
      status: this.status,
      slotDurationMinutes: this.slotDurationMinutes,
      bufferMinutes: this.bufferMinutes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
