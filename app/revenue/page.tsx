import Link from "next/link";

const modules = [
  ["Visão geral", "Métricas reais do funil e próximas ações", "/revenue"],
  ["Leads", "Leads, score explicável e oportunidade", "/revenue/leads"],
  ["Radar", "Pesquisa e enriquecimento de oportunidades", "/revenue/radar"],
  ["Campanhas", "Sequências e outreach supervisionado", "/revenue/campaigns"],
  ["Inbox", "Respostas, intenção e próxima ação", "/revenue/inbox"],
  ["Pipeline", "Encontrado → ganho/perdido", "/revenue/pipeline"],
  ["Configurações", "ICP, oferta e autonomia", "/revenue/settings"],
] as const;

export default function RevenuePage() {
  return (
    <main className="min-h-screen bg-[#070809] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">SF Growth AI</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Revenue Agent</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">AI Revenue Operating System: encontra oportunidades, pesquisa, qualifica, prepara abordagem e organiza a próxima melhor ação. Ações comerciais sensíveis exigem aprovação humana.</p>
          </div>
          <span className="w-fit rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">Fase 1 · execução supervisionada</span>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Leads encontrados", "Qualificados", "Respostas", "Pipeline"].map((label) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
              <p className="mt-3 text-2xl font-medium text-white/45">—</p>
              <p className="mt-1 text-xs text-white/30">Aguardando dados reais</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description, href]) => (
            <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/25 hover:bg-white/[0.055]">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-5 text-white/45">{description}</p></div>
                <span className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white">→</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Next Best Action</p>
          <h2 className="mt-3 text-xl font-medium">Defina primeiro o ICP e a oferta comercial.</h2>
          <p className="mt-2 text-sm text-white/45">O Radar não deve iniciar prospeção sem produto, preço mínimo, mercado e critérios de cliente ideal configurados.</p>
          <Link href="/revenue/settings" className="mt-5 inline-flex rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Configurar ICP</Link>
        </section>
      </div>
    </main>
  );
}
