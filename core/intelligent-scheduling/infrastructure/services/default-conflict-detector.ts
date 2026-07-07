import type { Appointment, ConflictDetector, Meeting, Reservation } from "../../domain";

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export class DefaultConflictDetector implements ConflictDetector {
  detectAppointmentConflicts(candidate: Appointment, existing: Appointment[]) {
    const active = existing.filter(
      (a) => a.id !== candidate.id && a.status !== "cancelled",
    );
    const conflicting = active.filter((a) =>
      overlaps(candidate.startAt, candidate.endAt, a.startAt, a.endAt),
    );

    return {
      hasConflict: conflicting.length > 0,
      conflictingIds: conflicting.map((a) => a.id),
      message:
        conflicting.length > 0
          ? `Conflito com ${conflicting.length} agendamento(s)`
          : "Sem conflitos",
    };
  }

  detectReservationConflicts(candidate: Reservation, existing: Reservation[]) {
    const active = existing.filter(
      (r) => r.id !== candidate.id && r.status !== "cancelled",
    );
    const conflicting = active.filter((r) =>
      overlaps(candidate.startAt, candidate.endAt, r.startAt, r.endAt),
    );

    return {
      hasConflict: conflicting.length > 0,
      conflictingIds: conflicting.map((r) => r.id),
      message:
        conflicting.length > 0
          ? `Conflito com ${conflicting.length} reserva(s)`
          : "Sem conflitos",
    };
  }

  detectMeetingConflicts(candidate: Meeting, existing: Meeting[]) {
    const active = existing.filter(
      (m) => m.id !== candidate.id && m.status !== "cancelled",
    );
    const conflicting = active.filter((m) =>
      overlaps(candidate.startAt, candidate.endAt, m.startAt, m.endAt),
    );

    return {
      hasConflict: conflicting.length > 0,
      conflictingIds: conflicting.map((m) => m.id),
      message:
        conflicting.length > 0
          ? `Conflito com ${conflicting.length} reunião(ões)`
          : "Sem conflitos",
    };
  }
}
