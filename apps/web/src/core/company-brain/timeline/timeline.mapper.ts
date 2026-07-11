import type { CompanyBrain, DiscoveryResult, TimelineEntry } from "../company-brain.types";
import type {
  CreateTimelineEventInput,
  TimelineEvent,
  TimelineEventType,
  TimelineImportance,
} from "./timeline.types";

function createEventId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function mapLegacySourceToEventType(entry: TimelineEntry): TimelineEventType {
  if (entry.label.toLowerCase().includes("oportunidade")) return "marketing";
  if (entry.label.toLowerCase().includes("lacuna")) return "discovery";
  if (entry.label.toLowerCase().includes("brain")) return "document";
  if (entry.source === "discovery") return "discovery";
  return "document";
}

function mapLegacyImportance(entry: TimelineEntry): TimelineImportance {
  const label = entry.label.toLowerCase();
  if (label.includes("lacuna") || label.includes("risco")) return "high";
  if (label.includes("oportunidade")) return "medium";
  if (label.includes("concluído") || label.includes("construído")) return "high";
  return "medium";
}

export function mapLegacyTimelineEntryToEvent(
  entry: TimelineEntry,
  tenantId: string,
  companyId: string,
): TimelineEvent {
  return {
    id: entry.id,
    tenantId,
    companyId,
    eventType: mapLegacySourceToEventType(entry),
    title: entry.label,
    description: entry.description,
    source: entry.source,
    createdBy: entry.source === "discovery" ? "discovery-engine" : "company-brain",
    importance: mapLegacyImportance(entry),
    createdAt: entry.date,
  };
}

export function mapCompanyBrainTimeline(brain: CompanyBrain): TimelineEvent[] {
  return brain.timeline.map((entry) =>
    mapLegacyTimelineEntryToEvent(entry, brain.organizationId, brain.companyId),
  );
}

export function mapDiscoveryToTimelineEvents(discovery: DiscoveryResult): TimelineEvent[] {
  const { session, report } = discovery;
  const tenantId = session.organizationId;
  const companyId = session.companyId;

  const events: TimelineEvent[] = [
    {
      id: `tl-${session.id}-started`,
      tenantId,
      companyId,
      eventType: "discovery",
      title: "Discovery iniciado",
      description: `Sessão ${session.id} criada para ${session.companyName}.`,
      source: "company-discovery",
      createdBy: session.initiatedBy ?? "system",
      importance: "medium",
      createdAt: session.startedAt,
    },
    {
      id: `tl-${session.id}-completed`,
      tenantId,
      companyId,
      eventType: "discovery",
      title: "Discovery concluído",
      description: report.summary,
      source: "company-discovery",
      createdBy: "discovery-engine",
      importance: "high",
      createdAt: report.generatedAt,
    },
  ];

  for (const gap of report.gaps) {
    events.push({
      id: `tl-gap-${gap.id}`,
      tenantId,
      companyId,
      eventType: "discovery",
      title: `Lacuna: ${gap.title}`,
      description: gap.recommendation,
      source: "company-discovery",
      createdBy: "discovery-engine",
      importance: gap.severity === "critical" ? "critical" : "high",
      createdAt: gap.detectedAt,
    });
  }

  for (const opportunity of report.opportunities) {
    events.push({
      id: `tl-opp-${opportunity.id}`,
      tenantId,
      companyId,
      eventType: "marketing",
      title: `Oportunidade: ${opportunity.title}`,
      description: opportunity.description,
      source: "company-discovery",
      createdBy: "discovery-engine",
      importance: opportunity.priority === "high" ? "high" : "medium",
      createdAt: opportunity.detectedAt,
    });
  }

  return events;
}

export function mapCreateInputToEvent(input: CreateTimelineEventInput): TimelineEvent {
  return {
    id: input.id ?? createEventId("tl"),
    tenantId: input.tenantId,
    companyId: input.companyId,
    eventType: input.eventType,
    title: input.title.trim(),
    description: input.description.trim(),
    source: input.source.trim(),
    createdBy: input.createdBy.trim(),
    importance: input.importance,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function mapCompanyBrainAndDiscoveryToTimelineEvents(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): TimelineEvent[] {
  const fromDiscovery = discovery ? mapDiscoveryToTimelineEvents(discovery) : [];
  const fromBrain = mapCompanyBrainTimeline(brain);

  const brainBuiltEvent: TimelineEvent = {
    id: `tl-brain-built-${brain.id}`,
    tenantId: brain.organizationId,
    companyId: brain.companyId,
    eventType: "document",
    title: "Company Brain construído",
    description: "Conhecimento estruturado gerado e indexado no Company Brain.",
    source: "company-brain",
    createdBy: "company-brain-builder",
    importance: "high",
    createdAt: brain.builtAt,
  };

  const merged = new Map<string, TimelineEvent>();
  for (const event of [...fromDiscovery, ...fromBrain, brainBuiltEvent]) {
    merged.set(event.id, event);
  }

  return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
