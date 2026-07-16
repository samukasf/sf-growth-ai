"use client";

import {
  CalendarDays,
  CheckCircle2,
  ContactRound,
  ExternalLink,
  FolderOpen,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/utils/cn";

import type {
  GoogleWorkspaceServiceStatus,
  GoogleWorkspaceSummary,
} from "./google-workspace.types";

type Props = {
  companyId?: string;
  onSummaryChange?: (summary: GoogleWorkspaceSummary | null) => void;
};

async function fetchWorkspaceSummary(companyId: string): Promise<GoogleWorkspaceSummary> {
  const response = await fetch(
    `/api/integrations/google/workspace?companyId=${encodeURIComponent(companyId)}`,
    { cache: "no-store" },
  );
  const payload = (await response.json()) as GoogleWorkspaceSummary & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Falha ao sincronizar");
  return payload;
}

const APPS = [
  { key: "gmail", label: "Gmail", icon: Mail, href: "https://mail.google.com/", unit: "não lidos" },
  { key: "calendar", label: "Google Agenda", icon: CalendarDays, href: "https://calendar.google.com/", unit: "hoje" },
  { key: "drive", label: "Google Drive", icon: FolderOpen, href: "https://drive.google.com/", unit: "recentes" },
  { key: "contacts", label: "Google Contatos", icon: ContactRound, href: "https://contacts.google.com/", unit: "sincronizado" },
] as const;

function ServiceRow({
  item,
  status,
}: {
  item: (typeof APPS)[number];
  status: GoogleWorkspaceServiceStatus;
}) {
  const Icon = item.icon;
  const detail = status.connected
    ? status.count === null
      ? item.unit
      : `${status.count} ${item.unit}`
    : status.error
      ? "Precisa de atenção"
      : "Aguardando ligação";

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="google-workspace-row group"
      aria-label={`Abrir ${item.label}`}
    >
      <span className="google-workspace-row__icon">
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-blue-950">{item.label}</span>
        <span className={cn("block text-[10px]", status.connected ? "text-emerald-600" : "text-slate-500")}>
          {detail}
        </span>
      </span>
      {status.connected ? (
        <CheckCircle2 className="size-4 text-emerald-500" />
      ) : (
        <span className="size-2 rounded-full bg-amber-400" />
      )}
      <ExternalLink className="size-3.5 text-slate-400 transition group-hover:text-blue-600" />
    </a>
  );
}

export function GoogleWorkspacePanel({ companyId, onSummaryChange }: Props) {
  const [summary, setSummary] = useState<GoogleWorkspaceSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchWorkspaceSummary(companyId);
      setSummary(payload);
      onSummaryChange?.(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao sincronizar");
    } finally {
      setLoading(false);
    }
  }, [companyId, onSummaryChange]);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    void fetchWorkspaceSummary(companyId)
      .then((payload) => {
        if (!cancelled) {
          setSummary(payload);
          onSummaryChange?.(payload);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Falha ao sincronizar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void fetchWorkspaceSummary(companyId)
        .then((payload) => {
          if (!cancelled) {
            setSummary(payload);
            setError(null);
            onSummaryChange?.(payload);
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) setError(caught instanceof Error ? caught.message : "Falha ao sincronizar");
        });
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [companyId, onSummaryChange]);

  if (!companyId) {
    return <p className="rounded-xl border border-dashed border-blue-200 p-4 text-xs text-slate-500">Crie a empresa para ativar o Google Workspace.</p>;
  }

  const disconnected: GoogleWorkspaceServiceStatus = { connected: false, count: null };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-blue-950">
            {summary?.connected ? "Google Workspace ativo" : loading ? "A sincronizar…" : "Ligar Google Workspace"}
          </p>
          <p className="truncate text-[10px] text-slate-500">
            {summary?.accountLabel ?? "Gmail, Agenda, Drive e Contatos"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition hover:border-blue-400 disabled:opacity-50"
          aria-label="Atualizar integrações"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {error && <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-[10px] text-rose-700">{error}</p>}

      <div className="space-y-1">
        {APPS.map((item) => (
          <ServiceRow key={item.key} item={item} status={summary?.[item.key] ?? disconnected} />
        ))}
      </div>

      {!summary?.connected && !loading && (
        <a
          href={`/integrations/google/connect?companyId=${encodeURIComponent(companyId)}`}
          className="mt-3 block rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-[10px] font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
        >
          Conectar Google Workspace
        </a>
      )}
    </div>
  );
}
