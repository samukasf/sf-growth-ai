import type {
  CalendarAvailabilityResult,
  CalendarEvent,
  CalendarEventSummary,
  CreateCalendarEventInput,
  ListCalendarEventsOptions,
  UpdateCalendarEventInput,
} from "./types";

/**
 * Contrato do provedor de calendário — permite trocar a implementação
 * (Google Calendar real, mock em testes) sem alterar a Calendar Tool.
 */
export interface CalendarProvider {
  listEvents(options: ListCalendarEventsOptions): Promise<CalendarEvent[]>;
  getTodayEvents(dayOffset?: number): Promise<CalendarEvent[]>;
  getWeekEvents(): Promise<CalendarEvent[]>;
  searchEvents(query: string, maxResults?: number): Promise<CalendarEvent[]>;
  getAvailability(timeMin: string, timeMax: string): Promise<CalendarAvailabilityResult>;
  createEvent(input: CreateCalendarEventInput): Promise<CalendarEvent>;
  updateEvent(input: UpdateCalendarEventInput): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  toEventSummary(event: CalendarEvent): CalendarEventSummary;
}
