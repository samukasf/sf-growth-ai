import type { AppointmentId, AppointmentReminderId, OrganizationId } from "../../shared";

export type ReminderChannel = "email" | "whatsapp" | "sms" | "push";
export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled";

export type AppointmentReminderProps = {
  id: AppointmentReminderId;
  organizationId: OrganizationId;
  appointmentId: AppointmentId;
  channel: ReminderChannel;
  minutesBefore: number;
  status: ReminderStatus;
  scheduledAt: string;
  sentAt?: string;
};

export class AppointmentReminder {
  readonly id: AppointmentReminderId;
  readonly organizationId: OrganizationId;
  readonly appointmentId: AppointmentId;
  readonly channel: ReminderChannel;
  readonly minutesBefore: number;
  readonly status: ReminderStatus;
  readonly scheduledAt: string;
  readonly sentAt?: string;

  private constructor(props: AppointmentReminderProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.appointmentId = props.appointmentId;
    this.channel = props.channel;
    this.minutesBefore = props.minutesBefore;
    this.status = props.status;
    this.scheduledAt = props.scheduledAt;
    this.sentAt = props.sentAt;
  }

  static create(
    props: Omit<AppointmentReminderProps, "id" | "status" | "sentAt"> & {
      id?: AppointmentReminderId;
      status?: ReminderStatus;
      sentAt?: string;
    },
  ): AppointmentReminder {
    return new AppointmentReminder({
      id: props.id ?? `reminder-${Date.now()}`,
      organizationId: props.organizationId,
      appointmentId: props.appointmentId,
      channel: props.channel,
      minutesBefore: props.minutesBefore,
      status: props.status ?? "pending",
      scheduledAt: props.scheduledAt,
      sentAt: props.sentAt,
    });
  }

  markSent(): AppointmentReminder {
    return AppointmentReminder.create({
      ...this.toJSON(),
      status: "sent",
      sentAt: new Date().toISOString(),
    });
  }

  toJSON(): AppointmentReminderProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      appointmentId: this.appointmentId,
      channel: this.channel,
      minutesBefore: this.minutesBefore,
      status: this.status,
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
    };
  }
}
