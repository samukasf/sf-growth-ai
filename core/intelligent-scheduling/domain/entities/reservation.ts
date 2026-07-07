import type { OrganizationId, ReservationId, ResourceId } from "../../shared";

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "expired";

export type ReservationProps = {
  id: ReservationId;
  organizationId: OrganizationId;
  resourceId: ResourceId;
  title: string;
  reservedBy: string;
  status: ReservationStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
};

export class Reservation {
  readonly id: ReservationId;
  readonly organizationId: OrganizationId;
  readonly resourceId: ResourceId;
  readonly title: string;
  readonly reservedBy: string;
  readonly status: ReservationStatus;
  readonly startAt: string;
  readonly endAt: string;
  readonly createdAt: string;

  private constructor(props: ReservationProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.resourceId = props.resourceId;
    this.title = props.title;
    this.reservedBy = props.reservedBy;
    this.status = props.status;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ReservationProps, "id" | "createdAt" | "status"> & {
      id?: ReservationId;
      createdAt?: string;
      status?: ReservationStatus;
    },
  ): Reservation {
    return new Reservation({
      id: props.id ?? `res-${Date.now()}`,
      organizationId: props.organizationId,
      resourceId: props.resourceId,
      title: props.title.trim(),
      reservedBy: props.reservedBy,
      status: props.status ?? "pending",
      startAt: props.startAt,
      endAt: props.endAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  confirm(): Reservation {
    return Reservation.create({ ...this.toJSON(), status: "confirmed" });
  }

  cancel(): Reservation {
    return Reservation.create({ ...this.toJSON(), status: "cancelled" });
  }

  toJSON(): ReservationProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      resourceId: this.resourceId,
      title: this.title,
      reservedBy: this.reservedBy,
      status: this.status,
      startAt: this.startAt,
      endAt: this.endAt,
      createdAt: this.createdAt,
    };
  }
}
