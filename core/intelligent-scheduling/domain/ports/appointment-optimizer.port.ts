import type { Appointment } from "../entities";
import type { OptimizationScore } from "../../shared";

export type OptimizationSuggestion = {
  appointmentId: string;
  suggestedStartAt: string;
  suggestedEndAt: string;
  score: OptimizationScore;
  reason: string;
};

export interface AppointmentOptimizer {
  optimize(
    appointments: Appointment[],
    constraints: { bufferMinutes: number; workingHoursStart: string; workingHoursEnd: string },
  ): OptimizationSuggestion[];
  suggestReschedule(appointment: Appointment, availableSlots: Array<{ startAt: string; endAt: string }>): OptimizationSuggestion | null;
}
