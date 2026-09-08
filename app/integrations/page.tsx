import Link from "next/link";
import { CalendarDays, Mail, MessageCircleMore, PanelsTopLeft, UsersRound } from "lucide-react";

const integrations = [
  {
    title: "Google Workspace",
    description: "Gmail, Google Agenda e Drive para o Samuel operar e consultar com contexto da empresa.",
    href: "/integrations/google/connect",
    icon: CalendarDays,
    action: "Configurar Google",
  },
  {
    title: "Meta",
    description: "Base de conexão para Facebook e Instagram, usada por marketing e publicação social.",
    href: "/integrations/meta/connect",
    icon: PanelsTopLeft,
    action: "Configurar Meta",
  },
  {
    title: "LinkedIn",
    description: "Conexão empresarial para presença, pesquisa e futuras ações de publicação.",
    href: "/integrations/linkedin/connect",
    icon: UsersRound,
    action: "Configurar LinkedIn",
  },
  {
    title: "WhatsApp Business",
    description: "Integração preparada para a WhatsApp Business Platform oficial. Requer token, número empresarial e ID da conta Meta Business no ambiente seguro.",
    href: "/samuel-ai",
    icon: MessageCircleMore,
    action: "Abrir Samuel",
  },
] as const;

export default function IntegrationsPage() {
  return (
    <main className="min-h-dvh bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-white/[.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-200/45">SF Growth AI</p>
            <h1 className="mt-2 text-3xl font-semibold">Integrações</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/38">Conecte somente os serviços que o Samuel precisa usar. Credenciais permanecem no ambiente seguro; o painel não exibe tokens.</p>
          </div>
          <Link href="/samuel-ai" className="rounded-xl border border-cyan-300/20 bg-cyan-300/[.07] px-4 py-2.5 text-xs font-semibold text-cyan-50">Voltar ao Samuel</Link>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {integrations.map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/[.07] bg-[#09131f] p-5 shadow-[0_18px_55px_rgba(0,0,0,.24)]">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200"><item.icon className="size-5" /></span>
                <div className="min-w-0"><h2 className="text-base font-semibold text-white/90">{item.title}</h2><p className="mt-2 text-xs leading-6 text-white/38">{item.description}</p></div>
              </div>
              <Link href={item.href} className="mt-5 inline-flex rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/62 transition hover:border-cyan-300/20 hover:text-cyan-50">{item.action}</Link>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-white/[.06] bg-white/[.02] p-5">
          <div className="flex items-center gap-3"><Mail className="size-5 text-cyan-200/45" /><div><strong className="text-sm text-white/75">Gmail e Agenda usam a mesma conexão Google Workspace</strong><p className="mt-1 text-xs text-white/32">Depois da conexão, os painéis E-mails e Agenda consultam dados reais da conta autorizada.</p></div></div>
        </section>
      </div>
    </main>
  );
}
