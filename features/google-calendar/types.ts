export type CalendarActionId =
  | "calendar_today"
  | "calendar_week"
  | "calendar_search"
  | "calendar_create"
  | "calendar_update"
  | "calendar_delete"
  | "calendar_availability";

export type CalendarErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_CONNECTED"
  | "AUTH_ERROR"
  | "NETWORK_ERROR"
  | "INVALID_INPUT"
  | "UNKNOWN";

export class CalendarApiError extends Error {
  readonly code: CalendarErrorCode;
  readonly status?: number;

  constructor(code: CalendarErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "CalendarApiError";
    this.code = code;
    this.status = options?.status;
  }
}

export type CalendarEventTime = {
  dateTime?: string;
  date?: string;
  timeZone?: string;
};

export type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarEventTime;
  end: CalendarEventTime;
  htmlLink?: string;
};

export type CalendarEventSummary = {
  id: string;
  title: string;
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
  location?: string;
};

export type CalendarFreeSlot = {
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
};

export type CalendarAvailabilityResult = {
  busyCount: number;
  freeSlots: CalendarFreeSlot[];
};

export type CreateCalendarEventInput = {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
};

export type UpdateCalendarEventInput = {
  eventId: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
};

export type ListCalendarEventsOptions = {
  timeMin: string;
  timeMax: string;
  query?: string;
  maxResults?: number;
};

export type CalendarToolInput = {
  actionId: CalendarActionId;
  query?: string;
  eventId?: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  /** Deslocamento de dias a partir de hoje (ex.: 1 = amanhã). */
  dayOffset?: number;
  maxResults?: number;
};

export type CalendarToolOutput = {
  actionId: CalendarActionId;
  summary: string;
  data: Record<string, unknown>;
};

