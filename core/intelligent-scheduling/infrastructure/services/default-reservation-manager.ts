import { Reservation, type ReservationManager, type Resource } from "../../domain";

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
}

export class DefaultReservationManager implements ReservationManager {
  create(
    resource: Resource,
    input: {
      title: string;
      reservedBy: string;
      startAt: string;
      endAt: string;
      organizationId: string;
    },
    existing: Reservation[],
  ) {
    if (resource.status !== "available") {
      return { success: false, message: `Recurso ${resource.name} indisponível` };
    }

    const conflict = existing.some(
      (r) =>
        r.status !== "cancelled" &&
        overlaps(input.startAt, input.endAt, r.startAt, r.endAt),
    );

    if (conflict) {
      return { success: false, message: "Conflito de reserva detectado" };
    }

    const reservation = Reservation.create({
      organizationId: input.organizationId,
      resourceId: resource.id,
      title: input.title,
      reservedBy: input.reservedBy,
      startAt: input.startAt,
      endAt: input.endAt,
    });

    return { success: true, reservation, message: "Reserva criada (simulada)" };
  }

  cancel(reservation: Reservation) {
    return reservation.cancel();
  }

  confirm(reservation: Reservation) {
    return reservation.confirm();
  }
}
