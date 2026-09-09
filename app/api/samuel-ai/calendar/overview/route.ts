import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  CalendarApiError,
  getGoogleCalendarProviderForCompany,
} from "@/features/google-calendar";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function calendarErrorResponse(error: unknown) {
  if (error instanceof CalendarApiError) {
    const reconnectRequired = ["NOT_CONNECTED", "AUTH_ERROR"].includes(error.code);
    const status =
      error.code === "NOT_CONNECTED"
        ? 409
        : error.code === "AUTH_ERROR"
          ? 401
          : error.code === "NOT_CONFIGURED"
            ? 503
            : error.code === "NETWORK_ERROR"
              ? 503
              : 502;

    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        summary: error.message,
        error: error.message,
        reconnectRequired,
        reconnectUrl: reconnectRequired ? "/integrations/google/connect" : null,
      },
      { status, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const message = error instanceof Error ? error.message : "Não foi possível carregar a Google Agenda.";
  return NextResponse.json(
    { ok: false, code: "UNKNOWN", summary: message, error: message, reconnectRequired: false },
    { status: 502, headers: { "Cache-Control": "private, no-store" } },
  );
}

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
    return calendarErrorResponse(error);
  }
}
