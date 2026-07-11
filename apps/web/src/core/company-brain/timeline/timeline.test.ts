import { describe, expect, it } from "vitest";

import { createSampleDiscoveryResult } from "../company-brain.fixture";
import { buildCompanyBrain } from "../company-brain.builder";
import {
  InMemoryTimelineRepository,
  TimelineService,
  groupTimelineByPeriod,
  mapCompanyBrainAndDiscoveryToTimelineEvents,
  presentTimelineGroupsForViewer,
} from "./index";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

describe("TimelineService", () => {
  it("creates, lists, filters and summarizes timeline events", async () => {
    const service = new TimelineService(new InMemoryTimelineRepository());

    const created = await service.create({
      tenantId: "org-1",
      companyId: "company-1",
      eventType: "discovery",
      title: "Discovery iniciado",
      description: "Primeira sessão de discovery.",
      source: "company-discovery",
      createdBy: "user-1",
      importance: "high",
      createdAt: daysAgo(0),
    });

    await service.create({
      tenantId: "org-1",
      companyId: "company-1",
      eventType: "marketing",
      title: "Campanha lançada",
      description: "Campanha de aquisição B2B.",
      source: "marketing-engine",
      createdBy: "samuel",
      importance: "medium",
      createdAt: daysAgo(2),
    });

    await service.create({
      tenantId: "org-1",
      companyId: "company-2",
      eventType: "financial",
      title: "Outra empresa",
      description: "Evento de outra company.",
      source: "finance",
      createdBy: "system",
      importance: "low",
      createdAt: daysAgo(1),
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const listed = await service.list({ companyId: "company-1" });
    expect(listed).toHaveLength(2);

    const filtered = service.filter(listed, { eventType: "discovery" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toBe("Discovery iniciado");

    const summary = await service.summarize({ companyId: "company-1" });
    expect(summary.total).toBe(2);
    expect(summary.byType.discovery).toBe(1);
    expect(summary.byType.marketing).toBe(1);
    expect(summary.headline).toContain("2 evento(s)");
  });

  it("maps company brain and discovery into official timeline events", () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain(discovery);
    const events = mapCompanyBrainAndDiscoveryToTimelineEvents(brain, discovery);

    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.tenantId && event.companyId)).toBe(true);
    expect(events.every((event) => event.title && event.description)).toBe(true);
    expect(events.some((event) => event.eventType === "discovery")).toBe(true);
    expect(events.some((event) => event.eventType === "document")).toBe(true);
  });

  it("groups events into Hoje, Esta semana and Este mês", async () => {
    const service = new TimelineService(new InMemoryTimelineRepository());
    const referenceDate = new Date("2026-07-11T15:00:00.000Z");

    await service.create({
      tenantId: "org-1",
      companyId: "company-1",
      eventType: "samuel",
      title: "Samuel respondeu",
      description: "Runtime alpha.",
      source: "samuel-runtime",
      createdBy: "samuel",
      importance: "high",
      createdAt: "2026-07-11T10:00:00.000Z",
    });

    await service.create({
      tenantId: "org-1",
      companyId: "company-1",
      eventType: "executive_council",
      title: "Conselho convocado",
      description: "Sessão executiva.",
      source: "executive-council",
      createdBy: "samuel",
      importance: "high",
      createdAt: "2026-07-09T10:00:00.000Z",
    });

    await service.create({
      tenantId: "org-1",
      companyId: "company-1",
      eventType: "financial",
      title: "Fechamento mensal",
      description: "Relatório financeiro.",
      source: "finance",
      createdBy: "system",
      importance: "medium",
      createdAt: "2026-07-02T10:00:00.000Z",
    });

    const events = await service.list({ companyId: "company-1" });
    const groups = groupTimelineByPeriod(events, referenceDate);
    const viewer = presentTimelineGroupsForViewer(
      events,
      await service.summarize({ companyId: "company-1" }),
      referenceDate,
    );

    expect(groups.find((group) => group.key === "today")?.events).toHaveLength(1);
    expect(groups.find((group) => group.key === "this_week")?.events).toHaveLength(1);
    expect(groups.find((group) => group.key === "this_month")?.events).toHaveLength(1);
    expect(viewer.groups.map((group) => group.label)).toEqual([
      "Hoje",
      "Esta semana",
      "Este mês",
    ]);
  });

  it("seeds timeline from company brain build", async () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain(discovery);
    const service = new TimelineService(new InMemoryTimelineRepository());

    const seeded = await service.seedFromCompanyBrain(brain, discovery);
    expect(seeded.length).toBeGreaterThan(0);

    const listed = await service.list({ companyId: brain.companyId });
    expect(listed.length).toBe(seeded.length);
  });
});
