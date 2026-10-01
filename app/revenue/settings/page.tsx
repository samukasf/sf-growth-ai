export default function RevenueSettingsPage() {
  return (
    <main className="min-h-screen bg-[#070809] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Revenue · Configurações</p>
        <h1 className="mt-2 text-3xl font-semibold">ICP e política comercial</h1>
        <p className="mt-3 text-sm text-white/50">Esta tela é conectada ao domínio Revenue, mas a persistência só será habilitada quando a migration da Fase 1 estiver aplicada. Nenhuma configuração é simulada.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {["Produto ou serviço", "Problema resolvido", "Benefício principal", "Preço", "Preço mínimo", "Mercados", "Setores", "Cliente ideal", "Diferenciais", "Provas", "Objeções comuns", "Metas"].map((label) => (
            <label key={label} className="text-sm text-white/60">{label}<input disabled placeholder="Aguardando backend Revenue" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/40 outline-none" /></label>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="font-medium">Autonomia inicial: Nível 1 — Prepara</p>
          <p className="mt-2 text-sm text-white/45">A IA prepara mensagens e recomendações. Envio, desconto, preço, contratos e alterações de orçamento permanecem sujeitos a aprovação humana.</p>
        </div>
      </div>
    </main>
  );
}
