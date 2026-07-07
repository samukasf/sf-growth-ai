import type { Appointment, Resource, ResourceAllocator } from "../../domain";

export class DefaultResourceAllocator implements ResourceAllocator {
  private readonly allocations = new Map<string, string>();

  allocate(
    appointment: Appointment,
    resources: Resource[],
    existingAppointments: Appointment[],
  ) {
    const available = resources.find((r) => r.status === "available");
    if (!available) {
      return { allocated: false, message: "Nenhum recurso disponível" };
    }

    const occupied = existingAppointments.some(
      (a) =>
        a.resourceId === available.id &&
        a.status !== "cancelled" &&
        a.id !== appointment.id &&
        a.startAt < appointment.endAt &&
        appointment.startAt < a.endAt,
    );

    if (occupied) {
      return { allocated: false, message: `Recurso ${available.name} ocupado` };
    }

    this.allocations.set(appointment.id, available.id);
    return {
      allocated: true,
      resourceId: available.id,
      message: `Recurso ${available.name} alocado (simulado)`,
    };
  }

  release(resourceId: string, appointmentId: string): void {
    if (this.allocations.get(appointmentId) === resourceId) {
      this.allocations.delete(appointmentId);
    }
  }
}
