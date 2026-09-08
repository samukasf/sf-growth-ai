"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircleMore,
  Mic,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

import type { WorkspaceSection } from "./workspace-navigation";

type Status = {
  configured: boolean;
  provider: string;
  phoneNumberIdConfigured: boolean;
  businessAccountConfigured: boolean;
  webhookConfigured: boolean;
  tenantScoped?: boolean;
  error?: string;
};

type SendResponse = {
  ok?: boolean;
  provider?: string;
  error?: string;
};

type Props = {
  companyId: string;
  onNavigate: (section: WorkspaceSection) => void;
};

export function WhatsAppBusinessPanel({ companyId, onNavigate }: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string | null>(null);

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
          tenantScoped: true,
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

  const prepareSend = () => {
    setSendError(null);
    setSendResult(null);
    const digits = to.replace(/[^0-9]/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setSendError("Informe o número completo com código do país.");
      return;
    }
    if (!message.trim()) {
      setSendError("Escreva a mensagem antes de revisar o envio.");
      return;
    }
    setReviewing(true);
  };

  const confirmSend = async () => {
    if (!status?.configured || sending) return;
    setSending(true);
    setSendError(null);
    setSendResult(null);
    try {
      const response = await fetch("/api/integrations/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, to, message, confirm: true }),
      });
      const payload = (await response.json()) as SendResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Falha ao enviar mensagem.");
      }
      setSendResult("Mensagem enviada pelo WhatsApp Business.");
      setReviewing(false);
      setMessage("");
    } catch (cause) {
      setSendError(cause instanceof Error ? cause.message : "Falha ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  };

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
            <p className="mt-1 text-xs text-white/40">Canal empresarial isolado por empresa, com revisão antes do envio.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("samuel-ai")}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50"
        >
          <Mic className="size-4" /> Preparar com Samuel
        </button>
      </header>

      <div className="mt-6 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-4">
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

            <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
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
                As credenciais globais não são mais aceitas sem proprietário. Configure esta empresa em <code>WHATSAPP_COMPANY_CONFIG_JSON</code> ou defina <code>WHATSAPP_OWNER_COMPANY_ID</code> para a configuração única.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/[.07] bg-[linear-gradient(180deg,rgba(17,70,55,.18),rgba(4,18,23,.4))] p-5">
            <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Segurança operacional</p>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-white/55">
              <p>• credenciais resolvidas para a empresa atual;</p>
              <p>• número e mensagem validados antes da chamada à Meta;</p>
              <p>• envio exige uma segunda ação de confirmação;</p>
              <p>• tokens nunca são enviados ao navegador.</p>
            </div>
            <Link href="/integrations" className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-semibold text-white/65 transition hover:bg-white/[.08] hover:text-white">
              Abrir integrações
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[.07] bg-[#091522] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-emerald-200/45">Nova mensagem</p>
              <h3 className="mt-1 text-base font-semibold text-white/85">Compositor WhatsApp</h3>
            </div>
            <Send className="size-5 text-emerald-200/45" />
          </div>

          <label className="mt-5 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/30">
            Destinatário
            <input
              value={to}
              onChange={(event) => { setTo(event.target.value); setReviewing(false); }}
              placeholder="+351912345678"
              disabled={!status?.configured}
              className="mt-2 w-full rounded-xl border border-white/[.08] bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-emerald-300/30 disabled:opacity-40"
            />
          </label>

          <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/30">
            Mensagem
            <textarea
              value={message}
              onChange={(event) => { setMessage(event.target.value); setReviewing(false); }}
              placeholder="Escreva a mensagem ou prepare o texto com Samuel."
              disabled={!status?.configured}
              rows={8}
              maxLength={4096}
              className="mt-2 w-full resize-y rounded-xl border border-white/[.08] bg-black/20 px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-emerald-300/30 disabled:opacity-40"
            />
          </label>
          <div className="mt-2 text-right text-[9px] text-white/20">{message.length}/4096</div>

          {sendError && <div className="mt-4 rounded-xl border border-rose-300/15 bg-rose-300/[.06] p-3 text-xs text-rose-100/75">{sendError}</div>}
          {sendResult && <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[.06] p-3 text-xs text-emerald-100/75">{sendResult}</div>}

          {!reviewing ? (
            <button
              type="button"
              onClick={prepareSend}
              disabled={!status?.configured || sending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ShieldCheck className="size-4" /> Revisar antes de enviar
            </button>
          ) : (
            <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/[.05] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-100/55">Confirmação obrigatória</p>
                  <p className="mt-2 text-xs text-white/50">Para: <strong className="text-white/80">{to}</strong></p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/70">{message}</p>
                </div>
                <button type="button" onClick={() => setReviewing(false)} aria-label="Cancelar revisão" className="rounded-lg p-2 text-white/35 hover:bg-white/[.05] hover:text-white"><X className="size-4" /></button>
              </div>
              <button
                type="button"
                onClick={() => void confirmSend()}
                disabled={sending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-slate-950 disabled:opacity-50"
              >
                {sending ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
                {sending ? "Enviando…" : "Confirmar e enviar agora"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
