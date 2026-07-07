import type { OrganizationId, ServiceId, WaitingListId } from "../../shared";

export type WaitingListStatus = "waiting" | "promoted" | "cancelled" | "expired";

export type WaitingListProps = {
  id: WaitingListId;
  organizationId: OrganizationId;
  serviceId: ServiceId;
  customerId: string;
  preferredDate?: string;
  status: WaitingListStatus;
  position: number;
  createdAt: string;
  promotedAt?: string;
};

export class WaitingList {
  readonly id: WaitingListId;
  readonly organizationId: OrganizationId;
  readonly serviceId: ServiceId;
  readonly customerId: string;
  readonly preferredDate?: string;
  readonly status: WaitingListStatus;
  readonly position: number;
  readonly createdAt: string;
  readonly promotedAt?: string;

  private constructor(props: WaitingListProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.serviceId = props.serviceId;
    this.customerId = props.customerId;
    this.preferredDate = props.preferredDate;
    this.status = props.status;
    this.position = props.position;
    this.createdAt = props.createdAt;
    this.promotedAt = props.promotedAt;
  }

  static create(
    props: Omit<WaitingListProps, "id" | "createdAt" | "status" | "promotedAt"> & {
      id?: WaitingListId;
      createdAt?: string;
      status?: WaitingListStatus;
      promotedAt?: string;
    },
  ): WaitingList {
    return new WaitingList({
      id: props.id ?? `wait-${Date.now()}`,
      organizationId: props.organizationId,
      serviceId: props.serviceId,
      customerId: props.customerId,
      preferredDate: props.preferredDate,
      status: props.status ?? "waiting",
      position: props.position,
      createdAt: props.createdAt ?? new Date().toISOString(),
      promotedAt: props.promotedAt,
    });
  }

  promote(): WaitingList {
    return WaitingList.create({
      ...this.toJSON(),
      status: "promoted",
      promotedAt: new Date().toISOString(),
    });
  }

  toJSON(): WaitingListProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      serviceId: this.serviceId,
      customerId: this.customerId,
      preferredDate: this.preferredDate,
      status: this.status,
      position: this.position,
      createdAt: this.createdAt,
      promotedAt: this.promotedAt,
    };
  }
}
