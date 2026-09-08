import Link from "next/link";
import { BarChart3, CheckCircle2, Instagram, Megaphone, PanelsTopLeft, RefreshCw, Send, TriangleAlert } from "lucide-react";

import { findMetaOAuthConnection } from "@/integrations/meta/meta-token.repository";
import { META_OAUTH_SCOPES, resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
import { resolveActiveCompany } from "@/services/executive-context.server";

export const dynamic = "force-dynamic";

type ConnectPageProps = {
  searchParams?: Promise<{
    companyId?: string;
    connected?: string;
    error?: string;
  }> | {
    companyId?: string;
    connected?: string;
    error?: string;
  };
};

const CAPABILITIES = [
  { label: "Facebook Page", permissions: ["pages_show_list", "pages_read_engagement"], description: "Página, conteúdo e métricas.", icon: PanelsTopLeft },
  { label: "Insights", permissions: ["pages_read_engagement", "instagram_manage_insights"], description: "Métricas de Facebook e Instagram.", icon: BarChart3 },
  { label: "Instagram Business", permissions: ["instagram_basic"], description: "Conta profissional ligada à Página.", icon: Instagram },
  { label: "Publicação", permissions: ["pages_manage_posts", "instagram_content_publish"], description: "Publicar conteúdo quando a app tiver Advanced Access.", icon: Send },
  { label: "Anúncios", permissions: ["ads_read", "ads_management"], description: "Ler e gerir campanhas autorizadas.", icon: Megaphone },
] as const;

export default async function MetaConnectPage({ searchParams }: ConnectPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const oauthReady = Boolean(resolveMetaOAuthConfig());

  const connection = company
    ? await findMetaOAuthConnection(company.id).catch(() => null)
    : null;
  const granted = new Set(
    (connection?.scopes ?? "")
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const pageName = connection?.pageName ?? connection?.pageId ?? null;
  const requestedPermissions = META_OAUTH_SCOPES.split(",").filter(Boolean);
  const knownPermissions = connection?.scopes ? granted.size : 0;

  const authorizeHref = company
    ? `/api/integrations/meta/oauth/authorize?companyId=${encodeURIComponent(company.id)}`
    : "/api/integrations/meta/oauth/authorize";

  return (
    <main className="min-h-dvh bg-[#04080d] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-white/[.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-200/45">SF Growth AI · Integrações</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Meta</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/38">Conecte Facebook e Instagram pela autorização oficial da Meta. O Samuel só trata como operacional aquilo que a conta e a app realmente concederam.</p>
          </div>
          <div className="flex gap-2">
            <Link href={company ? `/integrations?companyId=${company.id}` : "/integrations"} className="rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-2.5 text-xs font-semibold text-white/55">Integrações</Link>
            <Link href={company ? `/samuel-ai?companyId=${company.id}` : "/samuel-ai"} className="rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50">Voltar ao Samuel</Link>
          </div>
        </header>

        {params.connected === "1" && <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] px-4 py-3 text-xs text-emerald-100/80">Meta conectada com sucesso{pageName ? ` · ${pageName}` : ""}. As permissões concedidas foram registadas.</div>}
        {params.error && <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/[.06] px-4 py-3 text-xs text-rose-100/80">Falha na conexão: {params.error}</div>}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-3xl border border-white/[.08] bg-[#08131e] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] uppercase tracking-[.18em] text-white/25">Conta Meta</p><h2 className="mt-2 text-xl font-semibold text-white/90">{pageName ?? "Não conectada"}</h2><p className="mt-1 text-xs text-white/32">Empresa: {company?.name ?? "Nenhuma empresa ativa"}</p></div>
              <div className="rounded-2xl border border-white/[.07] bg-black/15 px-4 py-3 text-right"><span className="block text-[9px] uppercase tracking-[.14em] text-white/22">Permissões conhecidas</span><strong className="mt-1 block text-2xl text-cyan-100">{knownPermissions}/{requestedPermissions.length}</strong></div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {CAPABILITIES.map((capability) => {
                const ready = capability.permissions.every((permission) => granted.has(permission));
                const unknown = Boolean(connection) && !connection?.scopes;
                return (
                  <div key={capability.label} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
                    <div className="flex items-start gap-3"><span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${ready ? "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200" : "border-white/[.06] bg-white/[.025] text-white/25"}`}><capability.icon className="size-4" /></span><div><div className="flex items-center gap-2"><strong className="text-xs text-white/72">{capability.label}</strong>{ready ? <CheckCircle2 className="size-3.5 text-emerald-300" /> : <TriangleAlert className="size-3.5 text-amber-200/45" />}</div><p className="mt-1 text-[10px] leading-5 text-white/28">{capability.description}</p><span className={`mt-2 block text-[9px] font-semibold uppercase tracking-[.1em] ${ready ? "text-emerald-200/60" : "text-amber-100/45"}`}>{ready ? "Concedido" : unknown ? "Reconectar para verificar" : connection ? "Permissão ausente" : "Não conectado"}</span></div></div>
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="rounded-3xl border border-white/[.08] bg-[linear-gradient(180deg,rgba(19,36,60,.9),rgba(5,13,22,.94))] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Autorização oficial</p>
            <h2 className="mt-2 text-xl font-semibold">{connection ? "Meta conectada" : "Conectar Meta"}</h2>
            <p className="mt-2 text-xs leading-6 text-white/36">A Meta abre a própria tela de login e consentimento. Tokens ficam no backend e associados à empresa ativa.</p>
            <div className="mt-5 space-y-2 text-[10px] leading-5 text-white/35"><p>• Facebook e Instagram dependem de uma Página gerida pela conta autorizada.</p><p>• Publicação e gestão de anúncios podem exigir App Review / Advanced Access na Meta.</p><p>• Conexões antigas devem ser refeitas para solicitar as permissões de publicação e anúncios adicionadas agora.</p></div>
            {!oauthReady && <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-4 text-[10px] leading-5 text-amber-100/65">O backend ainda não encontrou META_APP_ID, META_APP_SECRET e META_OAUTH_REDIRECT_URI.</div>}
            <a href={authorizeHref} aria-disabled={!company || !oauthReady} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition ${company && oauthReady ? "bg-[#1877F2] text-white hover:brightness-110" : "pointer-events-none bg-white/[.05] text-white/25"}`}><RefreshCw className="size-4" />{connection ? "Reconectar Meta e atualizar permissões" : "Conectar Facebook e Instagram"}</a>
          </aside>
        </section>
      </div>
    </main>
  );
}
