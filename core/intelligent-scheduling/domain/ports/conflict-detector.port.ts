import type { Appointment, Meeting, Reservation } from "../entities";

export type ScheduleConflict = {
  hasConflict: boolean;
  conflictingIds: string[];
  message: string;
};

export interface ConflictDetector {
  detectAppointmentConflicts(
    candidate: Appointment,
    existing: Appointment[],
  ): ScheduleConflict;
  detectReservationConflicts(
    candidate: Reservation,
    existing: Reservation[],
  ): ScheduleConflict;
  detectMeetingConflicts(candidate: Meeting, existing: Meeting[]): ScheduleConflict;
}
