import type { AvailabilityId, OrganizationId } from "../../shared";

export type AvailabilityProps = {
  id: AvailabilityId;
  organizationId: OrganizationId;
  entityId: string;
  entityType: "employee" | "resource" | "calendar";
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export class Availability {
  readonly id: AvailabilityId;
  readonly organizationId: OrganizationId;
  readonly entityId: string;
  readonly entityType: "employee" | "resource" | "calendar";
  readonly dayOfWeek: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly active: boolean;

  private constructor(props: AvailabilityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.entityId = props.entityId;
    this.entityType = props.entityType;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.active = props.active;
  }

  static create(
    props: Omit<AvailabilityProps, "id"> & { id?: AvailabilityId },
  ): Availability {
    return new Availability({
      id: props.id ?? `avail-${Date.now()}`,
      organizationId: props.organizationId,
      entityId: props.entityId,
      entityType: props.entityType,
      dayOfWeek: props.dayOfWeek,
      startTime: props.startTime,
      endTime: props.endTime,
      active: props.active,
    });
  }

  toJSON(): AvailabilityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      entityId: this.entityId,
      entityType: this.entityType,
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      active: this.active,
    };
  }
}
