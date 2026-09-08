import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { getGoogleCalendarProviderForCompany } from "@/features/google-calendar";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim();
  const view = url.searchParams.get("view") === "today" ? "today" : "week";

  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  try {
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const rawEvents = view === "today" ? await provider.getTodayEvents() : await provider.getWeekEvents();
    const maxResults = view === "today" ? 12 : 30;
    const events = rawEvents.slice(0, maxResults).map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime ?? event.start.date ?? "",
      end: event.end.dateTime ?? event.end.date ?? "",
      allDay: Boolean(event.start.date && !event.start.dateTime),
      location: event.location,
    }));

    return NextResponse.json(
      {
        ok: true,
        summary: view === "today" ? "Google Agenda — hoje" : "Google Agenda — semana",
        data: { events },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível carregar a Google Agenda.";
    return NextResponse.json(
      { ok: false, summary: message, error: message },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
