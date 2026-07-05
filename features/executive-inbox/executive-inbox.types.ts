export type InboxActionType = "approve" | "complete" | "dismiss" | "defer";

export type ExecutiveInboxActionRecord = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: InboxItemType;
  action: InboxActionType;
  status: InboxStatus;
  timestamp: string;
  origin: string;
  area: string;
};

export type ExecutiveInboxActionsState = {
  companyId: string;
  actions: ExecutiveInboxActionRecord[];
  updatedAt: string;
};

export type InboxPriority = "Critical" | "High" | "Medium" | "Low";

export type InboxStatus =
  | "pending"
  | "urgent"
  | "resolved"
  | "archived"
  | "delegated"
  | "executing";

export type InboxCategory =
  | "today"
  | "urgent"
  | "this-week"
  | "marketing"
  | "finance"
  | "operations"
  | "sales"
  | "hr"
  | "legal"
  | "market"
  | "seo"
  | "google"
  | "meta"
  | "linkedin";

export type InboxItemType =
  | "alert"
  | "recommendation"
  | "priority"
  | "watcher"
  | "action"
  | "decision"
  | "timeline"
  | "ceo";

export type ExecutiveInboxItem = {
  id: string;
  type: InboxItemType;
  title: string;
  description: string;
  origin: string;
  priority: InboxPriority;
  impact: string;
  area: string;
  confidence: number;
  date: string;
  status: InboxStatus;
  categories: InboxCategory[];
};

export type ExecutiveInboxSummaryData = {
  pendingCount: number;
  urgentCount: number;
  resolvedCount: number;
  overallScore: number;
  totalItems: number;
};

export type ExecutiveInboxState = {
  items: ExecutiveInboxItem[];
  summary: ExecutiveInboxSummaryData;
};

export type ExecutiveInboxFilter = InboxCategory | "all";
