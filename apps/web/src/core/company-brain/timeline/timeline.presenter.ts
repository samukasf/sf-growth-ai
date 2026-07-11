import type {
  TimelineEvent,
  TimelineEventView,
  TimelineGroupedPresentation,
  TimelinePeriodGroup,
  TimelinePeriodKey,
  TimelineSummary,
} from "./timeline.types";
import { TIMELINE_EVENT_TYPE_LABELS, TIMELINE_PERIOD_LABELS } from "./timeline.types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return startOfDay(monday);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function resolveTimelinePeriod(
  createdAt: string,
  referenceDate: Date = new Date(),
): TimelinePeriodKey | null {
  const eventDate = new Date(createdAt);
  const todayStart = startOfDay(referenceDate);
  const weekStart = startOfWeek(referenceDate);
  const monthStart = startOfMonth(referenceDate);

  if (isSameDay(eventDate, referenceDate)) {
    return "today";
  }

  if (eventDate >= weekStart && eventDate < todayStart) {
    return "this_week";
  }

  if (eventDate >= monthStart && eventDate < weekStart) {
    return "this_month";
  }

  return null;
}

export function groupTimelineByPeriod(
  events: TimelineEvent[],
  referenceDate: Date = new Date(),
): TimelinePeriodGroup[] {
  const groups: Record<TimelinePeriodKey, TimelineEvent[]> = {
    today: [],
    this_week: [],
    this_month: [],
  };

  const sorted = [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  for (const event of sorted) {
    const period = resolveTimelinePeriod(event.createdAt, referenceDate);
    if (period) {
      groups[period].push(event);
    }
  }

  return (["today", "this_week", "this_month"] as TimelinePeriodKey[]).map((key) => ({
    key,
    label: TIMELINE_PERIOD_LABELS[key],
    events: groups[key],
  }));
}

export function presentTimelineEvent(event: TimelineEvent): TimelineEventView {
  return {
    id: event.id,
    type: TIMELINE_EVENT_TYPE_LABELS[event.eventType],
    title: event.title,
    description: event.description,
    importance: event.importance,
    source: event.source,
    createdBy: event.createdBy,
    createdAt: event.createdAt,
    formattedDate: new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(event.createdAt)),
  };
}

export function presentTimelineGrouped(
  events: TimelineEvent[],
  summary: TimelineSummary,
  referenceDate: Date = new Date(),
): TimelineGroupedPresentation {
  const groups = groupTimelineByPeriod(events, referenceDate).map((group) => ({
    ...group,
    events: group.events.map(presentTimelineEvent),
  }));

  return {
    groups,
    summary,
    total: events.length,
  };
}

export function presentTimelineGroupsForViewer(
  events: TimelineEvent[],
  summary: TimelineSummary,
  referenceDate: Date = new Date(),
) {
  const groups = groupTimelineByPeriod(events, referenceDate);

  return {
    summary,
    total: events.length,
    groups: groups.map((group) => ({
      key: group.key,
      label: group.label,
      events: group.events.map(presentTimelineEvent),
    })),
  };
}
