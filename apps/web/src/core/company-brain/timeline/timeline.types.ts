export type TimelineEventId = string;

export type TimelineEventType =
  | "discovery"
  | "memory"
  | "meeting"
  | "marketing"
  | "financial"
  | "sales"
  | "document"
  | "decision"
  | "automation"
  | "executive_council"
  | "samuel";

export type TimelineImportance = "low" | "medium" | "high" | "critical";

export type TimelineEvent = {
  id: TimelineEventId;
  tenantId: string;
  companyId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  source: string;
  createdBy: string;
  importance: TimelineImportance;
  createdAt: string;
};

export type CreateTimelineEventInput = Omit<TimelineEvent, "id" | "createdAt"> & {
  id?: TimelineEventId;
  createdAt?: string;
};

export type TimelineFilter = {
  tenantId?: string;
  companyId?: string;
  eventType?: TimelineEventType | TimelineEventType[];
  importance?: TimelineImportance | TimelineImportance[];
  source?: string;
  from?: string;
  to?: string;
  query?: string;
};

export type TimelineListOptions = TimelineFilter & {
  sort?: "asc" | "desc";
};

export type TimelineSummary = {
  total: number;
  byType: Partial<Record<TimelineEventType, number>>;
  byImportance: Partial<Record<TimelineImportance, number>>;
  latestEvent: TimelineEvent | null;
  headline: string;
  highlights: string[];
};

export type TimelinePeriodKey = "today" | "this_week" | "this_month";

export type TimelinePeriodGroup = {
  key: TimelinePeriodKey;
  label: string;
  events: TimelineEvent[];
};

export type TimelinePeriodGroupView = {
  key: TimelinePeriodKey;
  label: string;
  events: TimelineEventView[];
};

export type TimelineGroupedPresentation = {
  groups: TimelinePeriodGroupView[];
  summary: TimelineSummary;
  total: number;
};

export type TimelineEventView = {
  id: string;
  type: string;
  title: string;
  description: string;
  importance: TimelineImportance;
  source: string;
  createdBy: string;
  createdAt: string;
  formattedDate: string;
};

export const TIMELINE_EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  discovery: "Discovery",
  memory: "Memory",
  meeting: "Meeting",
  marketing: "Marketing",
  financial: "Financial",
  sales: "Sales",
  document: "Document",
  decision: "Decision",
  automation: "Automation",
  executive_council: "Executive Council",
  samuel: "Samuel",
};

export const TIMELINE_PERIOD_LABELS: Record<TimelinePeriodKey, string> = {
  today: "Hoje",
  this_week: "Esta semana",
  this_month: "Este mês",
};
