import { describe, expect, it, vi } from "vitest";

import { parseGoogleCalendarIntent } from "./calendar.intent";

describe("parseGoogleCalendarIntent", () => {
  it("detects today's agenda listing", () => {
    const plan = parseGoogleCalendarIntent("Mostre minha agenda de hoje");

    expect(plan?.actionId).toBe("calendar_today");
    expect(plan?.requiresConfirmation).toBe(false);
    expect(plan?.surface).toBe("calendar");
  });

  it("detects real event creation with confirmation", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-17T10:00:00.000Z"));
    const plan = parseGoogleCalendarIntent(
      "Agendar reunião com equipe de vendas amanhã às 10h",
    );

    expect(plan?.actionId).toBe("calendar_create");
    expect(plan?.requiresConfirmation).toBe(true);
    expect(plan?.args.title).toContain("equipe de vendas");
    expect(plan?.args.start).toBeTruthy();
    expect(plan?.args.end).toBeTruthy();
    vi.useRealTimers();
  });

  it("requires event id before deleting when id is missing", () => {
    const plan = parseGoogleCalendarIntent("Cancelar compromisso da agenda");

    expect(plan?.actionId).toBe("calendar_today");
    expect(plan?.requiresConfirmation).toBe(false);
  });

  it("detects event deletion by id with confirmation", () => {
    const plan = parseGoogleCalendarIntent("Cancelar evento id abc123XYZ da agenda");

    expect(plan?.actionId).toBe("calendar_delete");
    expect(plan?.args.eventId).toBe("abc123XYZ");
    expect(plan?.requiresConfirmation).toBe(true);
  });
});
