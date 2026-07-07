import type { OrganizationId, WorkingHoursId } from "../../shared";

export type WorkingHoursProps = {
  id: WorkingHoursId;
  organizationId: OrganizationId;
  entityId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
};

export class WorkingHours {
  readonly id: WorkingHoursId;
  readonly organizationId: OrganizationId;
  readonly entityId: string;
  readonly dayOfWeek: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly breakStart?: string;
  readonly breakEnd?: string;

  private constructor(props: WorkingHoursProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.entityId = props.entityId;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.breakStart = props.breakStart;
    this.breakEnd = props.breakEnd;
  }

  static create(
    props: Omit<WorkingHoursProps, "id"> & { id?: WorkingHoursId },
  ): WorkingHours {
    return new WorkingHours({
      id: props.id ?? `hours-${Date.now()}`,
      organizationId: props.organizationId,
      entityId: props.entityId,
      dayOfWeek: props.dayOfWeek,
      startTime: props.startTime,
      endTime: props.endTime,
      breakStart: props.breakStart,
      breakEnd: props.breakEnd,
    });
  }

  toJSON(): WorkingHoursProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      entityId: this.entityId,
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      breakStart: this.breakStart,
      breakEnd: this.breakEnd,
    };
  }
}
