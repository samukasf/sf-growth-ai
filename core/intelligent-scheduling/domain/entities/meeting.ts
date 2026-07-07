import type { CalendarId, MeetingId, OrganizationId } from "../../shared";

export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type MeetingProps = {
  id: MeetingId;
  organizationId: OrganizationId;
  calendarId: CalendarId;
  title: string;
  description: string;
  organizerId: string;
  attendeeIds: string[];
  status: MeetingStatus;
  startAt: string;
  endAt: string;
  location?: string;
  meetingUrl?: string;
  createdAt: string;
};

export class Meeting {
  readonly id: MeetingId;
  readonly organizationId: OrganizationId;
  readonly calendarId: CalendarId;
  readonly title: string;
  readonly description: string;
  readonly organizerId: string;
  readonly attendeeIds: string[];
  readonly status: MeetingStatus;
  readonly startAt: string;
  readonly endAt: string;
  readonly location?: string;
  readonly meetingUrl?: string;
  readonly createdAt: string;

  private constructor(props: MeetingProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.calendarId = props.calendarId;
    this.title = props.title;
    this.description = props.description;
    this.organizerId = props.organizerId;
    this.attendeeIds = [...props.attendeeIds];
    this.status = props.status;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.location = props.location;
    this.meetingUrl = props.meetingUrl;
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
      calendarId: props.calendarId,
      title: props.title.trim(),
      description: props.description.trim(),
      organizerId: props.organizerId,
      attendeeIds: props.attendeeIds,
      status: props.status ?? "scheduled",
      startAt: props.startAt,
      endAt: props.endAt,
      location: props.location,
      meetingUrl: props.meetingUrl,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): MeetingProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      calendarId: this.calendarId,
      title: this.title,
      description: this.description,
      organizerId: this.organizerId,
      attendeeIds: [...this.attendeeIds],
      status: this.status,
      startAt: this.startAt,
      endAt: this.endAt,
      location: this.location,
      meetingUrl: this.meetingUrl,
      createdAt: this.createdAt,
    };
  }
}
