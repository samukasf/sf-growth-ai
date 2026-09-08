"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Mic,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { cn } from "@/utils/cn";
import type { WorkspaceSection } from "./workspace-navigation";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
};

type CalendarResponse = {
  ok: boolean;
  summary: string;
  data?: { events?: CalendarEvent[] };
  error?: string;
};

type Props = {
  companyId: string;
  onNavigate: (section: WorkspaceSection) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "2-digit", month: "short" }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function GoogleAgendaPanel({ companyId, onNavigate }: Props) {
  const [view, setView] = useState<"today" | "week">("week");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/samuel-ai/calendar/overview?companyId=${encodeURIComponent(companyId)}&view=${view}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as CalendarResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || payload.summary || "Não foi possível carregar a agenda.");
      }
      setEvents(payload.data?.events ?? []);
    } catch (cause) {
      setEvents([]);
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, [companyId, view]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-PT");
    if (!query) return events;
    return events.filter((event) =>
      [event.title, event.location]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("pt-PT").includes(query)),
    );
  }, [events, search]);

  return (
    <section className="min-h-[calc(100dvh-130px)] overflow-hidden rounded-[28px] border border-white/[.07] bg-[#07111c] text-white shadow-[0_24px_80px_rgba(0,0,0,.28)]">
      <header className="flex flex-col gap-4 border-b border-white/[.07] bg-[linear-gradient(180deg,rgba(8,31,53,.82),rgba(5,17,29,.75))] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[.08] text-cyan-200"><CalendarDays className="size-5" /></span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-200/55">Google Workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Agenda</h2>
            <p className="mt-1 text-xs text-white/40">Compromissos reais da conta Google ligada à empresa.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onNavigate("samuel-ai")} className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-3.5 py-2.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-300/[.12]"><Mic className="size-4" /> Comandar por voz</button>
          <button type="button" onClick={() => onNavigate("samuel-ai")} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-xs font-semibold text-white/75 transition hover:bg-white/[.08]"><Plus className="size-4" /> Novo compromisso</button>
        </div>
      </header>

      <div className="grid min-h-0 lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-white/[.06] bg-black/10 p-4 lg:border-b-0 lg:border-r lg:p-5">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {(["today", "week"] as const).map((option) => (
              <button key={option} type="button" onClick={() => setView(option)} className={cn("rounded-xl border px-3 py-3 text-left text-xs font-semibold transition", view === option ? "border-cyan-300/25 bg-cyan-300/[.09] text-cyan-50" : "border-white/[.06] bg-white/[.025] text-white/45 hover:text-white/75")}>{option === "today" ? "Hoje" : "Esta semana"}</button>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[.07] bg-black/20 px-3 py-2.5">
            <Search className="size-4 text-white/30" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrar agenda" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25" />
          </label>

          <button type="button" onClick={() => void load()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.07] px-3 py-2.5 text-xs text-white/50 transition hover:bg-white/[.04] hover:text-white/80"><RefreshCw className={cn("size-4", loading && "animate-spin")} /> Atualizar</button>

          {error && (
            <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[.06] p-3 text-xs leading-relaxed text-amber-100/75">
              <p>{error}</p>
              <Link href="/integrations/google/connect" className="mt-2 inline-block font-semibold text-cyan-200 hover:text-cyan-100">Ligar Google Workspace</Link>
            </div>
          )}
        </aside>

        <div className="min-h-0 p-4 sm:p-5 lg:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-[10px] uppercase tracking-[.18em] text-white/25">{view === "today" ? "Hoje" : "Próximos compromissos"}</p><strong className="mt-1 block text-sm text-white/75">{filtered.length} evento(s)</strong></div>
          </div>

          {loading ? (
            <div className="grid gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-white/[.05] bg-white/[.025]" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[.018] text-center"><CalendarDays className="size-10 text-cyan-200/35" /><strong className="mt-4 text-sm text-white/65">Nenhum compromisso encontrado</strong><p className="mt-2 max-w-sm text-xs leading-relaxed text-white/32">Crie ou consulte compromissos pelo Samuel usando voz ou texto.</p></div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((event) => (
                <article key={event.id} className="rounded-2xl border border-white/[.065] bg-white/[.028] p-4 transition hover:border-cyan-300/15 hover:bg-white/[.04]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-cyan-200/50">{formatDate(event.start)}</p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-white/85">{event.title || "Compromisso sem título"}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/38"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{event.allDay ? "Dia inteiro" : `${formatTime(event.start)} – ${formatTime(event.end)}`}</span>{event.location && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{event.location}</span>}</div>
                    </div>
                    <button type="button" onClick={() => onNavigate("samuel-ai")} className="shrink-0 rounded-xl border border-white/[.07] px-3 py-2 text-[10px] font-semibold text-white/45 transition hover:border-cyan-300/20 hover:text-cyan-100">Pedir ao Samuel</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
