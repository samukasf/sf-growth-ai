export type ContextSource =
  | "MEMORY"
  | "COMPANY_BRAIN"
  | "PROJECTS"
  | "CLIENTS"
  | "AGENDA"
  | "FINANCIAL"
  | "MARKETING"
  | "DOCUMENTS"
  | "CONVERSATIONS"
  | "EXECUTIVE_COUNCIL";

export type ContextPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ContextFragment {
  id: string;
  source: ContextSource;
  title: string;
  content: string;
  priority: ContextPriority;
  tags: string[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Context {
  id: string;
  tenantId: string;
  companyId: string;
  query?: string;
  fragments: ContextFragment[];
  builtAt: string;
}

export interface ContextInput {
  tenantId: string;
  companyId: string;
  query?: string;
  sources?: ContextSource[];
  limit?: number;
  since?: string;
}

export interface ContextTimelineEntry {
  timestamp: string;
  source: ContextSource;
  title: string;
  content: string;
  priority: ContextPriority;
}

export interface ContextSummaryResult {
  tenantId: string;
  companyId: string;
  totalFragments: number;
  bySource: Partial<Record<ContextSource, number>>;
  byPriority: Partial<Record<ContextPriority, number>>;
  topTags: string[];
  generatedAt: string;
}

export interface ContextOutput {
  context: Context;
  summary: ContextSummaryResult;
  prioritizedFragments: ContextFragment[];
  timeline: ContextTimelineEntry[];
  generatedAt: string;
}

export interface ContextResolveResult {
  sources: ContextSource[];
  input: ContextInput;
}

export interface ContextSourceProvider {
  source: ContextSource;
  fetch(input: ContextInput): Promise<ContextFragment[]>;
}
