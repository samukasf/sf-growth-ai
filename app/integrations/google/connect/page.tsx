import Link from "next/link";
import { CalendarDays, CheckCircle2, FolderOpen, Mail, MapPin, RefreshCw, Store, TriangleAlert, UsersRound } from "lucide-react";

import { resolveActiveCompany } from "@/services/executive-context.server";
import { getGoogleIntegrationStatus, type GoogleCapabilityKey } from "@/features/google-integrations/google-capabilities.server";
import { GoogleIntegrationTestPanel } from "@/features/google-integrations/google-integration-test-panel";

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

const CAPABILITIES: Array<{
  key: GoogleCapabilityKey;
  label: string;
  description: string;
  icon: typeof Mail;
}> = [
  { key: "gmail", label: "Gmail", description: "Ler, pesquisar, preparar, enviar e organizar e-mails.", icon: Mail },
  { key: "calendar", label: "Google Agenda", description: "Consultar, criar e alterar compromissos e reuniões.", icon: CalendarDays },
  { key: "drive", label: "Google Drive", description: "Pesquisar e usar arquivos como contexto operacional.", icon: FolderOpen },
  { key: "contacts", label: "Google Contatos", description: "Resolver pessoas e contatos da conta autorizada.", icon: UsersRound },
  { key: "businessProfile", label: "Google Business Profile", description: "Acessar os perfis empresariais exibidos no Google e Maps.", icon: Store },
  { key: "places", label: "Google Maps / Places", description: "Pesquisar empresas, locais, telefones, sites e endereços.", icon: MapPin },
  { key: "geocoding", label: "Geocoding", description: "Transformar endereços em coordenadas e contexto geográfico.", icon: MapPin },
];

export default async function GoogleConnectPage({ searchParams }: ConnectPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const status = company ? await getGoogleIntegrationStatus(company.id) : null;

  const authorizeHref = company
    ? `/api/integrations/google/oauth/authorize?companyId=${encodeURIComponent(company.id)}`
    : "/api/integrations/google/oauth/authorize";

  const connectedCount = status
    ? CAPABILITIES.filter((capability) => status.capabilities[capability.key]).length
    : 0;

  return (
    <main className="min-h-dvh bg-[#04080d] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/[.07] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-200/45">SF Growth AI · Integrações</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Google</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/38">Uma única autorização pode dar ao Samuel acesso operacional ao Gmail, Agenda, Drive, Contatos, Google Business Profile e Google Maps/Places. Cada capacidade permanece separada e só fica ativa quando a permissão correspondente foi concedida.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/integrations" className="rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-2.5 text-xs font-semibold text-white/55 transition hover:bg-white/[.06] hover:text-white">Integrações</Link>
            <Link href={company ? `/samuel-ai?companyId=${company.id}` : "/samuel-ai"} className="rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50">Voltar ao Samuel</Link>
          </div>
        </header>

        {params.connected === "1" && (
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] px-4 py-3 text-xs text-emerald-100/80">Google conectado com sucesso. As capacidades abaixo foram atualizadas de acordo com as permissões realmente concedidas.</div>
        )}
        {params.error && (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/[.06] px-4 py-3 text-xs text-rose-100/80">Falha na conexão: {params.error}</div>
        )}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-3xl border border-white/[.08] bg-[#08131e] p-5 shadow-[0_24px_80px_rgba(0,0,0,.25)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Conta autorizada</p>
                <h2 className="mt-2 text-xl font-semibold text-white/90">{status?.email ?? "Google ainda não conectado"}</h2>
                <p className="mt-2 text-xs text-white/35">Empresa: {company?.name ?? "Nenhuma empresa ativa"}</p>
              </div>
              <div className="rounded-2xl border border-white/[.07] bg-black/15 px-4 py-3 text-right">
                <span className="block text-[9px] uppercase tracking-[.14em] text-white/22">Capacidades</span>
                <strong className="mt-1 block text-2xl text-cyan-100">{connectedCount}/{CAPABILITIES.length}</strong>
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {CAPABILITIES.map((capability) => {
                const connected = Boolean(status?.capabilities[capability.key]);
                return (
                  <div key={capability.key} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
                    <div className="flex items-start gap-3">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${connected ? "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200" : "border-white/[.06] bg-white/[.025] text-white/25"}`}><capability.icon className="size-4" /></span>
                      <div className="min-w-0"><div className="flex items-center gap-2"><strong className="text-xs text-white/72">{capability.label}</strong>{connected ? <CheckCircle2 className="size-3.5 text-emerald-300" /> : <TriangleAlert className="size-3.5 text-amber-200/45" />}</div><p className="mt-1 text-[10px] leading-5 text-white/28">{capability.description}</p><span className={`mt-2 block text-[9px] font-semibold uppercase tracking-[.12em] ${connected ? "text-emerald-200/60" : "text-amber-200/45"}`}>{connected ? "Permissão concedida" : status?.connected ? "Reconexão necessária" : "Não conectado"}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="rounded-3xl border border-white/[.08] bg-[linear-gradient(180deg,rgba(10,31,48,.92),rgba(5,13,22,.94))] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Conexão</p>
            <h2 className="mt-2 text-xl font-semibold">{status?.connected ? "Google conectado" : "Conectar Google"}</h2>
            <p className="mt-2 text-xs leading-6 text-white/36">Ao conectar, o Google mostrará a tela oficial de consentimento. O SF Growth AI guarda apenas os tokens necessários no backend e associa a conexão à empresa ativa.</p>

            <div className="mt-5 space-y-2 text-[10px] leading-5 text-white/35">
              <p>• Gmail e Agenda funcionam com a mesma conta autorizada.</p>
              <p>• Business Profile precisa da API Business Profile habilitada no projeto Google Cloud.</p>
              <p>• Places/Maps e Geocoding precisam das APIs correspondentes habilitadas e de faturamento válido no Google Cloud.</p>
              <p>• Contas conectadas antes destes novos recursos precisam ser reconectadas para conceder os novos scopes.</p>
            </div>

            {!status?.oauthConfigured && <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-4 text-[10px] leading-5 text-amber-100/65">O backend ainda não encontrou GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_OAUTH_REDIRECT_URI. O botão de conexão só funcionará depois dessas variáveis estarem presentes em produção.</div>}

            <a href={authorizeHref} aria-disabled={!company || !status?.oauthConfigured} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition ${company && status?.oauthConfigured ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110" : "pointer-events-none bg-white/[.05] text-white/25"}`}><RefreshCw className="size-4" />{status?.connected ? "Reconectar Google e atualizar permissões" : "Conectar conta Google"}</a>
          </aside>
        </section>

        {company && status?.connected && <div className="mt-5"><GoogleIntegrationTestPanel companyId={company.id} /></div>}
      </div>
    </main>
  );
}
