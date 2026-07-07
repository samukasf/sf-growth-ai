import type {
  AppointmentId,
  CalendarId,
  OrganizationId,
  ResourceId,
  ServiceId,
} from "../../shared";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentProps = {
  id: AppointmentId;
  organizationId: OrganizationId;
  calendarId: CalendarId;
  serviceId?: ServiceId;
  resourceId?: ResourceId;
  title: string;
  description: string;
  customerId?: string;
  employeeId?: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  autoConfirm: boolean;
  autoCheckIn: boolean;
  createdAt: string;
  updatedAt: string;
};

export class Appointment {
  readonly id: AppointmentId;
  readonly organizationId: OrganizationId;
  readonly calendarId: CalendarId;
  readonly serviceId?: ServiceId;
  readonly resourceId?: ResourceId;
  readonly title: string;
  readonly description: string;
  readonly customerId?: string;
  readonly employeeId?: string;
  readonly status: AppointmentStatus;
  readonly startAt: string;
  readonly endAt: string;
  readonly autoConfirm: boolean;
  readonly autoCheckIn: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: AppointmentProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.calendarId = props.calendarId;
    this.serviceId = props.serviceId;
    this.resourceId = props.resourceId;
    this.title = props.title;
    this.description = props.description;
    this.customerId = props.customerId;
    this.employeeId = props.employeeId;
    this.status = props.status;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.autoConfirm = props.autoConfirm;
    this.autoCheckIn = props.autoCheckIn;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AppointmentProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: AppointmentId;
      createdAt?: string;
      updatedAt?: string;
      status?: AppointmentStatus;
    },
  ): Appointment {
    const now = new Date().toISOString();
    return new Appointment({
      id: props.id ?? `appt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      calendarId: props.calendarId,
      serviceId: props.serviceId,
      resourceId: props.resourceId,
      title: props.title.trim(),
      description: props.description.trim(),
      customerId: props.customerId,
      employeeId: props.employeeId,
      status: props.status ?? "pending",
      startAt: props.startAt,
      endAt: props.endAt,
      autoConfirm: props.autoConfirm,
      autoCheckIn: props.autoCheckIn,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  confirm(): Appointment {
    return Appointment.create({
      ...this.toJSON(),
      status: "confirmed",
      updatedAt: new Date().toISOString(),
    });
  }

  cancel(): Appointment {
    return Appointment.create({
      ...this.toJSON(),
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });
  }

  complete(): Appointment {
    return Appointment.create({
      ...this.toJSON(),
      status: "completed",
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): AppointmentProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      calendarId: this.calendarId,
      serviceId: this.serviceId,
      resourceId: this.resourceId,
      title: this.title,
      description: this.description,
      customerId: this.customerId,
      employeeId: this.employeeId,
      status: this.status,
      startAt: this.startAt,
      endAt: this.endAt,
      autoConfirm: this.autoConfirm,
      autoCheckIn: this.autoCheckIn,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
