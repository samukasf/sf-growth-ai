import type { Availability, Holiday, WorkingHours } from "../entities";
import type { AvailabilityScore } from "../../shared";

export type TimeSlot = {
  startAt: string;
  endAt: string;
  available: boolean;
};

export interface AvailabilityEngine {
  computeSlots(
    availabilities: Availability[],
    workingHours: WorkingHours[],
    holidays: Holiday[],
    date: string,
    slotDurationMinutes: number,
  ): TimeSlot[];
  score(slots: TimeSlot[]): AvailabilityScore;
}
