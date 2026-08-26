import Link from "next/link";

export default function RevenueRadarPage() {
  return <main className="min-h-screen bg-[#070809] px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-6xl">
    <p className="text-xs uppercase tracking-[.25em] text-white/40">Revenue · Market Agent</p>
    <h1 className="mt-2 text-3xl font-semibold">Radar de oportunidades</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">Defina o mercado que deseja pesquisar. O Radar só apresentará leads provenientes de fontes efetivamente conectadas; fontes indisponíveis aparecerão como “Conectar”, nunca como resultados simulados.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {["País / região", "Setor / tipo de negócio", "Ticket desejado", "Idioma", "Sinais de compra", "Critérios de exclusão"].map((label) => <label key={label} className="text-sm text-white/60">{label}<input disabled placeholder="Disponível após conectar fonte" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-white/35" /></label>)}
    </div>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[['Pesquisa web','Preparado'],['Google Maps','Conectar'],['Apollo','Conectar'],['Listas importadas','Próximo incremento']].map(([name,status]) => <div key={name} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="font-medium">{name}</p><p className="mt-2 text-xs text-white/40">{status}</p></div>)}
    </div>
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.025] p-6"><h2 className="text-lg font-medium">Nenhuma pesquisa executada</h2><p className="mt-2 text-sm text-white/45">Configure o ICP e conecte uma fonte antes de iniciar o Lead Finder.</p><Link href="/revenue/settings" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">Configurar ICP</Link></div>
  </div></main>;
}
