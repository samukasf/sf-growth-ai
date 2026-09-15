import Link from "next/link";
import { BarChart3, Megaphone, RefreshCw, Search, Video } from "lucide-react";

import { getGoogleMarketingOverview } from "@/features/google-integrations/google-marketing.server";
import { resolveActiveCompany } from "@/services/executive-context.server";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ companyId?: string }> | { companyId?: string };
};

function StatusCard({
  title,
  subtitle,
  ok,
  detail,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  ok: boolean;
  detail: string;
  icon: typeof Megaphone;
}) {
  return (
    <article className="rounded-3xl border border-white/[.08] bg-[#07131f] p-5">
      <div className="flex items-start gap-3">
        <span className={`flex size-10 items-center justify-center rounded-2xl border ${ok ? "border-emerald-300/15 bg-emerald-300/[.07] text-emerald-200" : "border-amber-300/15 bg-amber-300/[.06] text-amber-100"}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-white/90">{title}</h2>
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] ${ok ? "bg-emerald-300/[.08] text-emerald-200/70" : "bg-amber-300/[.07] text-amber-100/60"}`}>
              {ok ? "Conectado" : "Atenção"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-white/35">{subtitle}</p>
        </div>
      </div>
      <p className={`mt-4 rounded-2xl border p-3 text-[10px] leading-5 ${ok ? "border-white/[.06] bg-white/[.02] text-white/45" : "border-amber-300/10 bg-amber-300/[.04] text-amber-100/65"}`}>
        {detail}
      </p>
    </article>
  );
}

export default async function GoogleMarketingPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const company = await resolveActiveCompany(params.companyId?.trim() || null).catch(() => null);
  const overview = company ? await getGoogleMarketingOverview(company.id) : null;
  const connectHref = company
    ? `/api/integrations/google/oauth/authorize?companyId=${encodeURIComponent(company.id)}`
    : "/api/integrations/google/oauth/authorize";

  const disconnected = "Conecte uma empresa e autorize o Google.";
  const adsDetail = !overview
    ? disconnected
    : overview.ads.ok
      ? `${overview.ads.data.accounts.length} conta(s) Google Ads acessível(is) pela conta autorizada.`
      : overview.ads.error;
  const analyticsDetail = !overview
    ? disconnected
    : overview.analytics.ok
      ? `${overview.analytics.data.accounts.length} conta(s) Analytics disponível(is), com ${overview.analytics.data.accounts.reduce((sum, account) => sum + account.properties.length, 0)} propriedade(s) GA4.`
      : overview.analytics.error;
  const searchConsoleDetail = !overview
    ? disconnected
    : overview.searchConsole.ok
      ? `${overview.searchConsole.data.sites.length} propriedade(s) Search Console acessível(is).`
      : overview.searchConsole.error;
  const youtubeDetail = !overview
    ? disconnected
    : overview.youtube.ok
      ? `${overview.youtube.data.channels.length} canal(is) YouTube encontrado(s).`
      : overview.youtube.error;

  return (
    <main className="min-h-dvh bg-[#04080d] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/[.07] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-200/45">SF Growth AI · Google</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Marketing & Performance</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/38">
              A mesma autorização Google do Samuel agora pode alimentar Google Ads, GA4, Search Console e YouTube, além de Gmail, Agenda, Drive, Contatos, Business Profile e Maps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={company ? `/integrations/google/connect?companyId=${company.id}` : "/integrations/google/connect"} className="rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-2.5 text-xs font-semibold text-white/55 transition hover:bg-white/[.06] hover:text-white">Google principal</Link>
            <a href={connectHref} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${company ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white" : "pointer-events-none bg-white/[.05] text-white/25"}`}>
              <RefreshCw className="size-4" /> Reconectar e conceder permissões
            </a>
          </div>
        </header>

        <section className="mt-5 rounded-3xl border border-white/[.08] bg-[linear-gradient(180deg,rgba(10,31,48,.92),rgba(5,13,22,.94))] p-5">
          <p className="text-[10px] uppercase tracking-[.18em] text-white/25">Empresa ativa</p>
          <h2 className="mt-2 text-xl font-semibold">{company?.name ?? "Nenhuma empresa ativa"}</h2>
          <p className="mt-2 text-xs leading-5 text-white/35">Depois de reconectar o Google, use esta tela para confirmar quais produtos realmente responderam com a conta escolhida.</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <StatusCard title="Google Ads" subtitle="Contas de anúncios que o Samuel poderá analisar e operar conforme as permissões da API." ok={Boolean(overview?.ads.ok)} detail={adsDetail} icon={Megaphone} />
          <StatusCard title="Google Analytics 4" subtitle="Contas e propriedades GA4 para tráfego, conversões e performance." ok={Boolean(overview?.analytics.ok)} detail={analyticsDetail} icon={BarChart3} />
          <StatusCard title="Search Console" subtitle="Sites verificados, consultas orgânicas, cliques, impressões e posições." ok={Boolean(overview?.searchConsole.ok)} detail={searchConsoleDetail} icon={Search} />
          <StatusCard title="YouTube" subtitle="Canais ligados à conta Google para análise de conteúdo e audiência." ok={Boolean(overview?.youtube.ok)} detail={youtubeDetail} icon={Video} />
        </section>

        <section className="mt-5 rounded-3xl border border-white/[.08] bg-[#07131f] p-5 text-[10px] leading-5 text-white/35">
          <strong className="text-white/65">APIs a habilitar no mesmo Google Cloud Project:</strong> Gmail API, Calendar API, Drive API, People API, Business Profile APIs, Places API, Geocoding API, Google Ads API, Google Analytics Admin/Data APIs, Search Console API e YouTube Data API v3. A disponibilidade final depende também de a conta Google escolhida ter acesso aos respetivos produtos.
        </section>
      </div>
    </main>
  );
}
