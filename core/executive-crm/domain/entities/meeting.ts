import type { CustomerId, MeetingId, OrganizationId } from "../../shared";

export type MeetingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export type MeetingProps = {
  id: MeetingId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  status: MeetingStatus;
  attendees: string[];
  location?: string;
  createdAt: string;
};

export class Meeting {
  readonly id: MeetingId;
  readonly organizationId: OrganizationId;
  readonly customerId: CustomerId;
  readonly title: string;
  readonly description: string;
  readonly scheduledAt: string;
  readonly durationMinutes: number;
  readonly status: MeetingStatus;
  readonly attendees: string[];
  readonly location?: string;
  readonly createdAt: string;

  private constructor(props: MeetingProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.title = props.title;
    this.description = props.description;
    this.scheduledAt = props.scheduledAt;
    this.durationMinutes = props.durationMinutes;
    this.status = props.status;
    this.attendees = [...props.attendees];
    this.location = props.location;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<MeetingProps, "id" | "createdAt" | "status"> & {
      id?: MeetingId;
      createdAt?: string;
      status?: MeetingStatus;
    },
  ): Meeting {
    return new Meeting({
      id: props.id ?? `meeting-${Date.now()}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      title: props.title.trim(),
      description: props.description.trim(),
      scheduledAt: props.scheduledAt,
      durationMinutes: props.durationMinutes,
      status: props.status ?? "scheduled",
      attendees: props.attendees,
      location: props.location,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MeetingProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      title: this.title,
      description: this.description,
      scheduledAt: this.scheduledAt,
      durationMinutes: this.durationMinutes,
      status: this.status,
      attendees: [...this.attendees],
      location: this.location,
      createdAt: this.createdAt,
    };
  }
}
