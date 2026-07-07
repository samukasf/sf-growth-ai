import type {
  CalendarId,
  OrganizationId,
  RecurringScheduleId,
  ServiceId,
} from "../../shared";

export type RecurrenceFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "custom";

export type RecurringScheduleProps = {
  id: RecurringScheduleId;
  organizationId: OrganizationId;
  calendarId: CalendarId;
  serviceId?: ServiceId;
  title: string;
  frequency: RecurrenceFrequency;
  cronExpression?: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  durationMinutes: number;
  active: boolean;
  createdAt: string;
};

export class RecurringSchedule {
  readonly id: RecurringScheduleId;
  readonly organizationId: OrganizationId;
  readonly calendarId: CalendarId;
  readonly serviceId?: ServiceId;
  readonly title: string;
  readonly frequency: RecurrenceFrequency;
  readonly cronExpression?: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly startTime: string;
  readonly durationMinutes: number;
  readonly active: boolean;
  readonly createdAt: string;

  private constructor(props: RecurringScheduleProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.calendarId = props.calendarId;
    this.serviceId = props.serviceId;
    this.title = props.title;
    this.frequency = props.frequency;
    this.cronExpression = props.cronExpression;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.startTime = props.startTime;
    this.durationMinutes = props.durationMinutes;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<RecurringScheduleProps, "id" | "createdAt" | "active"> & {
      id?: RecurringScheduleId;
      createdAt?: string;
      active?: boolean;
    },
  ): RecurringSchedule {
    return new RecurringSchedule({
      id: props.id ?? `recur-${Date.now()}`,
      organizationId: props.organizationId,
      calendarId: props.calendarId,
      serviceId: props.serviceId,
      title: props.title.trim(),
      frequency: props.frequency,
      cronExpression: props.cronExpression,
      startDate: props.startDate,
      endDate: props.endDate,
      startTime: props.startTime,
      durationMinutes: props.durationMinutes,
      active: props.active ?? true,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): RecurringScheduleProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      calendarId: this.calendarId,
      serviceId: this.serviceId,
      title: this.title,
      frequency: this.frequency,
      cronExpression: this.cronExpression,
      startDate: this.startDate,
      endDate: this.endDate,
      startTime: this.startTime,
      durationMinutes: this.durationMinutes,
      active: this.active,
      createdAt: this.createdAt,
    };
  }
}
