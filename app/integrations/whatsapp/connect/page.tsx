import Link from "next/link";
import { CheckCircle2, Link2, MessageCircleMore, ShieldCheck, TriangleAlert } from "lucide-react";

import { getWhatsAppConfigStatus } from "@/features/whatsapp/whatsapp-config.server";
import { resolveMetaGraphApiVersion, resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
import { resolveActiveCompany } from "@/services/executive-context.server";

import { EmbeddedSignupButton } from "./EmbeddedSignupButton";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ companyId?: string; connected?: string }> | { companyId?: string; connected?: string };
};

export default async function WhatsAppConnectPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const companyId = company?.id ?? null;
  const status = companyId ? await getWhatsAppConfigStatus(companyId).catch(() => null) : null;
  const meta = resolveMetaOAuthConfig();
  const configId = process.env.META_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID?.trim() ?? "";
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() ?? "";
  const readyForEmbeddedSignup = Boolean(companyId && meta?.appId && configId);
  const webhookUrl = "https://sf-growth-ai.vercel.app/api/integrations/whatsapp/webhook";

  return (
    <main className="min-h-dvh bg-[#04080d] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-white/[.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-200/45">SF Growth AI · Integrações</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">WhatsApp Business</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/38">Onboarding oficial da Meta para que cada cliente conecte o próprio WhatsApp Business. Número, WABA e token ficam isolados por empresa no backend.</p>
          </div>
          <div className="flex gap-2">
            <Link href={companyId ? `/integrations?companyId=${companyId}` : "/integrations"} className="rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-2.5 text-xs font-semibold text-white/55">Integrações</Link>
            <Link href={companyId ? `/samuel-ai?companyId=${companyId}` : "/samuel-ai"} className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.07] px-4 py-2.5 text-xs font-semibold text-emerald-50">Voltar ao Samuel</Link>
          </div>
        </header>

        {params.connected === "1" && (
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] px-4 py-3 text-xs text-emerald-100/80">WhatsApp Business conectado e associado à empresa ativa.</div>
        )}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <article className="rounded-3xl border border-white/[.08] bg-[#08131e] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Empresa ativa</p>
                <h2 className="mt-2 text-xl font-semibold text-white/90">{company?.name ?? "Nenhuma empresa selecionada"}</h2>
                <p className="mt-1 text-xs text-white/32">Cada empresa mantém a própria ligação ao WhatsApp.</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.1em] ${status?.configured ? "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200/70" : "border-amber-300/15 bg-amber-300/[.05] text-amber-100/55"}`}>
                {status?.configured ? <CheckCircle2 className="size-3" /> : <TriangleAlert className="size-3" />}
                {status?.configured ? "Conectado" : "Não conectado"}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
                <MessageCircleMore className="size-4 text-emerald-200/55" />
                <strong className="mt-3 block text-xs text-white/70">Número empresarial</strong>
                <p className="mt-1 text-[10px] leading-5 text-white/28">{status?.displayPhoneNumber ?? "Ainda não associado"}</p>
              </div>
              <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
                <ShieldCheck className="size-4 text-cyan-200/55" />
                <strong className="mt-3 block text-xs text-white/70">Isolamento por tenant</strong>
                <p className="mt-1 text-[10px] leading-5 text-white/28">{status?.source === "database" ? "Credencial dedicada desta empresa" : status?.configured ? "Compatibilidade temporária por ambiente" : "Será criada no onboarding"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/[.06] bg-black/15 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/30">O que o cliente fará</p>
              <div className="mt-3 space-y-2 text-[10px] leading-5 text-white/35">
                <p>1. Entrará na própria conta Meta.</p>
                <p>2. Escolherá ou criará o Portfólio empresarial e a conta WhatsApp Business.</p>
                <p>3. Escolherá/verificará o número que deseja conectar.</p>
                <p>4. O SF Growth AI recebe somente os identificadores e o token empresarial autorizados para aquele tenant.</p>
              </div>
            </div>

            {status?.configured ? (
              <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.04] p-4 text-[10px] leading-5 text-emerald-100/65">Conexão operacional{status.verifiedName ? ` · ${status.verifiedName}` : ""}. Para trocar o número/empresa, execute novamente o Embedded Signup quando a configuração da Meta estiver disponível.</div>
            ) : readyForEmbeddedSignup && meta ? (
              <div className="mt-5">
                <EmbeddedSignupButton appId={meta.appId} configId={configId} graphVersion={resolveMetaGraphApiVersion()} companyId={companyId as string} />
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-4 text-[10px] leading-5 text-amber-100/65">O fluxo está preparado, mas falta concluir a configuração da app Meta. Precisamos de META_APP_ID, META_APP_SECRET e META_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID antes de abrir o onboarding aos clientes.</div>
            )}
          </article>

          <aside className="rounded-3xl border border-white/[.08] bg-[linear-gradient(180deg,rgba(14,45,35,.72),rgba(5,13,22,.94))] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Configuração SaaS</p>
            <h2 className="mt-2 text-xl font-semibold">Uma app Meta, vários clientes</h2>
            <p className="mt-2 text-xs leading-6 text-white/36">Não vamos cadastrar tokens manualmente cliente por cliente. A app central do SF Growth AI fará onboarding e armazenará a ligação de cada empresa de forma separada.</p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/[.06] bg-black/15 p-4">
                <div className="flex items-center gap-2"><Link2 className="size-3.5 text-cyan-200/50" /><strong className="text-[10px] text-white/60">Webhook de produção</strong></div>
                <code className="mt-2 block break-all text-[9px] leading-5 text-white/30">{webhookUrl}</code>
              </div>
              <div className="rounded-2xl border border-white/[.06] bg-black/15 p-4">
                <strong className="text-[10px] text-white/60">Verificação do webhook</strong>
                <p className="mt-2 text-[9px] leading-5 text-white/30">{webhookVerifyToken ? "Token de verificação configurado no servidor." : "Ainda falta WHATSAPP_WEBHOOK_VERIFY_TOKEN no ambiente de produção."}</p>
              </div>
              <div className="rounded-2xl border border-white/[.06] bg-black/15 p-4">
                <strong className="text-[10px] text-white/60">Liberação para clientes externos</strong>
                <p className="mt-2 text-[9px] leading-5 text-white/30">A app Meta precisa de Business Verification e das permissões/revisões exigidas pela Meta para Embedded Signup e mensagens de clientes externos.</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
