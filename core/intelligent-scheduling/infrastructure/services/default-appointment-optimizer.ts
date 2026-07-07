import type { Appointment, AppointmentOptimizer } from "../../domain";

export class DefaultAppointmentOptimizer implements AppointmentOptimizer {
  optimize(
    appointments: Appointment[],
    constraints: { bufferMinutes: number; workingHoursStart: string; workingHoursEnd: string },
  ) {
    return appointments.map((appointment) => {
      const score =
        appointment.status === "confirmed"
          ? { value: 85, label: "good" as const }
          : { value: 60, label: "fair" as const };

      return {
        appointmentId: appointment.id,
        suggestedStartAt: appointment.startAt,
        suggestedEndAt: appointment.endAt,
        score,
        reason: `Otimização simulada com buffer de ${constraints.bufferMinutes}min`,
      };
    });
  }

  suggestReschedule(
    appointment: Appointment,
    availableSlots: Array<{ startAt: string; endAt: string }>,
  ) {
    const slot = availableSlots[0];
    if (!slot) return null;

    return {
      appointmentId: appointment.id,
      suggestedStartAt: slot.startAt,
      suggestedEndAt: slot.endAt,
      score: { value: 75, label: "good" as const },
      reason: "Remarcação inteligente simulada",
    };
  }
}
