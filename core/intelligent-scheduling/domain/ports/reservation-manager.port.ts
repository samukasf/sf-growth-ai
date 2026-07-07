import type { Reservation, Resource } from "../entities";

export type ReservationResult = {
  success: boolean;
  reservation?: Reservation;
  message: string;
};

export interface ReservationManager {
  create(
    resource: Resource,
    input: { title: string; reservedBy: string; startAt: string; endAt: string; organizationId: string },
    existing: Reservation[],
  ): ReservationResult;
  cancel(reservation: Reservation): Reservation;
  confirm(reservation: Reservation): Reservation;
}
