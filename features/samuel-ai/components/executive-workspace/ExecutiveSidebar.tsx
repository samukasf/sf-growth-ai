"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BellRing,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Film,
  Gauge,
  Globe2,
  Inbox,
  Mail,
  Megaphone,
  MessageCircleMore,
  Radar,
  Scale,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { cn } from "@/utils/cn";
import type { WorkspaceSection } from "./workspace-navigation";

type ExecutiveSidebarProps = {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type NavItem = { id: WorkspaceSection; label: string; description?: string; icon: LucideIcon };

const PRIMARY_ITEMS: NavItem[] = [
  { id: "samuel-ai", label: "Início / Samuel", description: "Falar e executar", icon: Bot },
  { id: "studio", label: "Vídeos e Redes", description: "Criar, revisar e publicar", icon: Film },
  { id: "executive-alerts", label: "Alertas", description: "O que precisa de atenção", icon: BellRing },
  { id: "executive-inbox", label: "Tarefas", description: "Inbox e execução", icon: Inbox },
  { id: "crm", label: "Clientes", description: "CRM e oportunidades", icon: BriefcaseBusiness },
  { id: "dashboard", label: "Resultados", description: "Indicadores e crescimento", icon: BarChart3 },
];

const ADVANCED_ITEMS: NavItem[] = [
  { id: "gmail", label: "E-mails", icon: Mail },
  { id: "executive-agenda", label: "Agenda", icon: CalendarDays },
  { id: "whatsapp", label: "WhatsApp Business", icon: MessageCircleMore },
  { id: "executive-tasks", label: "Decisões e tarefas", icon: ShieldCheck },
  { id: "executive-watchers", label: "Monitorização", icon: Radar },
  { id: "executive-timeline", label: "Linha do tempo", icon: Activity },
  { id: "site-builder", label: "Sites e Apps", icon: Globe2 },
  { id: "autonomous-improvement", label: "Autoevolução", icon: BrainCircuit },
  { id: "marketing", label: "Marketing e anúncios", icon: Megaphone },
  { id: "sales", label: "Vendas", icon: BriefcaseBusiness },
  { id: "finance", label: "Finanças", icon: CircleDollarSign },
  { id: "operations", label: "Operações", icon: Gauge },
  { id: "hr", label: "Pessoas", icon: UsersRound },
  { id: "legal", label: "Jurídico", icon: Scale },
  { id: "google-business", label: "Google Business", icon: Building2 },
  { id: "google-analytics", label: "Google Analytics", icon: BarChart3 },
  { id: "search-console", label: "Search Console", icon: Search },
  { id: "meta", label: "Meta", icon: Megaphone },
  { id: "linkedin", label: "LinkedIn", icon: UsersRound },
];

export function ExecutiveSidebar({ activeSection, onSectionChange, mobileOpen = false, onMobileClose }: ExecutiveSidebarProps) {
  const select = (section: WorkspaceSection) => {
    onSectionChange(section);
    onMobileClose?.();
  };

  const content = (
    <nav className="flex min-h-full flex-col bg-[linear-gradient(180deg,#04101a,#02080e)] p-4 text-white">
      <button type="button" onClick={() => select("samuel-ai")} className="mb-5 flex items-center gap-3 rounded-2xl px-2 py-1 text-left">
        <span className="relative flex size-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,.10)]"><BrainCircuit className="size-[18px]" /><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-[#04101a] bg-emerald-300" /></span>
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-white/85">Samuel IA</p><p className="mt-0.5 text-[9px] text-white/30">SF Growth AI</p></div>
      </button>

      <p className="mb-2 px-2 text-[8px] font-semibold uppercase tracking-[.2em] text-white/24">Acesso rápido</p>
      <div className="space-y-1">
        {PRIMARY_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return <button key={item.id} type="button" onClick={() => select(item.id)} className={cn("group flex min-h-[54px] w-full items-center gap-3 rounded-2xl border px-3 text-left transition", active ? "border-cyan-300/20 bg-cyan-300/[.075] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.04)]" : "border-transparent text-white/52 hover:border-white/[.06] hover:bg-white/[.035] hover:text-white/82")}><span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", active ? "border-cyan-300/18 bg-cyan-300/[.09] text-cyan-100" : "border-white/[.06] bg-white/[.02] text-white/36 group-hover:text-white/68")}><item.icon className="size-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[11px] font-semibold">{item.label}</strong><small className="mt-0.5 block truncate text-[9px] font-normal text-white/28">{item.description}</small></span>{active && <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.7)]" />}</button>;
        })}
      </div>

      <details className="group mt-4 rounded-2xl border border-white/[.055] bg-white/[.018]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-[10px] font-medium text-white/42 transition hover:text-white/72"><span>Mais ferramentas</span><ChevronDown className="size-3.5 transition group-open:rotate-180" /></summary>
        <div className="max-h-[38dvh] space-y-0.5 overflow-y-auto border-t border-white/[.05] p-2">
          {ADVANCED_ITEMS.map((item) => <button key={item.id} type="button" onClick={() => select(item.id)} className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[10px] transition", activeSection === item.id ? "bg-cyan-300/[.07] text-cyan-50" : "text-white/38 hover:bg-white/[.035] hover:text-white/68")}><item.icon className="size-3.5 shrink-0" />{item.label}</button>)}
        </div>
      </details>

      <div className="mt-auto space-y-2 pt-4">
        <Link href="/samuel-ai/desktop" className="flex min-h-10 items-center justify-between rounded-xl border border-white/[.055] px-3 text-[9px] text-white/38 transition hover:bg-white/[.035] hover:text-white/70"><span>Meu computador</span><span>→</span></Link>
        <Link href="/integrations" className="flex min-h-10 items-center justify-between rounded-xl border border-white/[.055] px-3 text-[9px] text-white/38 transition hover:bg-white/[.035] hover:text-white/70"><span>Integrações e configuração</span><span>→</span></Link>
      </div>
    </nav>
  );

  return <>{mobileOpen && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />}<aside className={cn("fixed inset-y-0 left-0 z-50 w-[276px] shrink-0 border-r border-cyan-300/[.07] bg-[#04101a]/98 shadow-[12px_0_40px_rgba(0,0,0,.22)] backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}><div className="flex h-full flex-col overflow-y-auto">{content}</div></aside></>;
}
