import type { Availability, Holiday, WorkingHours, AvailabilityEngine } from "../../domain";

export class DefaultAvailabilityEngine implements AvailabilityEngine {
  computeSlots(
    availabilities: Availability[],
    workingHours: WorkingHours[],
    holidays: Holiday[],
    date: string,
    slotDurationMinutes: number,
  ) {
    const dayOfWeek = new Date(date).getDay();
    const isHoliday = holidays.some((h) => h.date === date);

    if (isHoliday) return [];

    const hours = workingHours.filter((h) => h.dayOfWeek === dayOfWeek);
    const activeAvail = availabilities.filter((a) => a.active && a.dayOfWeek === dayOfWeek);

    if (hours.length === 0 && activeAvail.length === 0) return [];

    const slots = [];
    const baseStart = hours[0]?.startTime ?? activeAvail[0]?.startTime ?? "09:00";
    const baseEnd = hours[0]?.endTime ?? activeAvail[0]?.endTime ?? "17:00";

    const [startH, startM] = baseStart.split(":").map(Number);
    const [endH, endM] = baseEnd.split(":").map(Number);
    let cursor = new Date(date);
    cursor.setHours(startH ?? 9, startM ?? 0, 0, 0);
    const end = new Date(date);
    end.setHours(endH ?? 17, endM ?? 0, 0, 0);

    while (cursor.getTime() + slotDurationMinutes * 60000 <= end.getTime()) {
      const slotEnd = new Date(cursor.getTime() + slotDurationMinutes * 60000);
      slots.push({
        startAt: cursor.toISOString(),
        endAt: slotEnd.toISOString(),
        available: true,
      });
      cursor = slotEnd;
    }

    return slots;
  }

  score(slots: Array<{ available: boolean }>) {
    const available = slots.filter((s) => s.available).length;
    const value = slots.length > 0 ? Math.round((available / slots.length) * 100) : 0;
    return { value, slotsAvailable: available };
  }
}
