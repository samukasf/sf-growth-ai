"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircleMore, Mic, RefreshCw, ShieldCheck } from "lucide-react";

import type { WorkspaceSection } from "./workspace-navigation";

type Status = {
  configured: boolean;
  provider: string;
  phoneNumberIdConfigured: boolean;
  businessAccountConfigured: boolean;
  webhookConfigured: boolean;
  error?: string;
};

type Props = {
  companyId: string;
  onNavigate: (section: WorkspaceSection) => void;
};

export function WhatsAppBusinessPanel({ companyId, onNavigate }: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/integrations/whatsapp/status?companyId=${encodeURIComponent(companyId)}`, { cache: "no-store" })
      .then(async (response) => ({ response, payload: (await response.json()) as Status }))
      .then(({ response, payload }) => {
        if (cancelled) return;
        if (!response.ok) throw new Error(payload.error || "Falha ao verificar WhatsApp Business.");
        setStatus(payload);
      })
      .catch((cause) => {
        if (cancelled) return;
        setStatus({
          configured: false,
          provider: "WhatsApp Business Platform",
          phoneNumberIdConfigured: false,
          businessAccountConfigured: false,
          webhookConfigured: false,
          error: cause instanceof Error ? cause.message : "Falha ao verificar WhatsApp Business.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return (
    <section className="min-h-[calc(100dvh-130px)] rounded-[28px] border border-white/[.07] bg-[#07111c] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,.28)] sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[.08] text-emerald-200">
            <MessageCircleMore className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-200/55">Meta</p>
            <h2 className="mt-1 text-xl font-semibold">WhatsApp Business</h2>
            <p className="mt-1 text-xs text-white/40">Canal empresarial para atendimento e execução assistida.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("samuel-ai")}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50"
        >
          <Mic className="size-4" /> Operar com Samuel
        </button>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-white/[.07] bg-white/[.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Estado da integração</p>
              <strong className="mt-2 block text-lg text-white/85">
                {loading ? "A verificar…" : status?.configured ? "Pronto para mensagens" : "Configuração necessária"}
              </strong>
            </div>
            {loading ? <RefreshCw className="size-5 animate-spin text-cyan-200/50" /> : status?.configured ? <CheckCircle2 className="size-6 text-emerald-300" /> : <ShieldCheck className="size-6 text-amber-200/60" />}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              ["Número empresarial", status?.phoneNumberIdConfigured],
              ["Conta Business", status?.businessAccountConfigured],
              ["Webhook", status?.webhookConfigured],
            ].map(([label, ready]) => (
              <div key={String(label)} className="rounded-2xl border border-white/[.06] bg-black/15 p-4">
                <span className={`block size-2 rounded-full ${ready ? "bg-emerald-300" : "bg-white/15"}`} />
                <strong className="mt-3 block text-xs text-white/70">{String(label)}</strong>
                <span className="mt-1 block text-[10px] text-white/28">{ready ? "Configurado" : "Pendente"}</span>
              </div>
            ))}
          </div>

          {!status?.configured && !loading && (
            <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-4 text-xs leading-relaxed text-amber-50/70">
              O painel e o endpoint de envio já estão preparados, mas a conta só entra em operação depois de configurar as credenciais oficiais do WhatsApp Business Platform no ambiente seguro.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/[.07] bg-[linear-gradient(180deg,rgba(17,70,55,.18),rgba(4,18,23,.4))] p-5">
          <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Capacidades</p>
          <div className="mt-4 space-y-3 text-xs text-white/55">
            <p>• enviar mensagens de texto com confirmação explícita;</p>
            <p>• usar Samuel para preparar respostas e follow-ups;</p>
            <p>• centralizar atendimento quando webhook e inbox estiverem ligados;</p>
            <p>• evoluir para campanhas/template messages sem misturar credenciais de empresas.</p>
          </div>
          <Link href="/integrations" className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-semibold text-white/65 transition hover:bg-white/[.08] hover:text-white">
            Abrir integrações
          </Link>
        </div>
      </div>
    </section>
  );
}
