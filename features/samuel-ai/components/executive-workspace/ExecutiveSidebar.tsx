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
  Globe2,
  Gauge,
  Inbox,
  Mail,
  Megaphone,
  MessageCircleMore,
  Radar,
  Scale,
  Search,
  ShieldCheck,
  UsersRound,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/utils/cn";

import type { WorkspaceSection } from "./workspace-navigation";

type ExecutiveSidebarProps = {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type NavItem = {
  id: WorkspaceSection;
  label: string;
  description?: string;
  icon: LucideIcon;
};

const PRIMARY_ITEMS: NavItem[] = [
  { id: "samuel-ai", label: "Samuel", description: "Comando e conversa", icon: Bot },
  { id: "executive-inbox", label: "Work", description: "Inbox, agenda e execução", icon: Inbox },
  { id: "dashboard", label: "Growth", description: "Prioridades e crescimento", icon: BarChart3 },
  { id: "studio", label: "Studio", description: "Criação e produção", icon: WandSparkles },
  { id: "crm", label: "Clients", description: "Clientes e oportunidades", icon: BriefcaseBusiness },
];

const ADVANCED_ITEMS: NavItem[] = [
  { id: "gmail", label: "E-mails", icon: Mail },
  { id: "executive-agenda", label: "Google Agenda", icon: CalendarDays },
  { id: "whatsapp", label: "WhatsApp Business", icon: MessageCircleMore },
  { id: "executive-tasks", label: "Tarefas e decisões", icon: ShieldCheck },
  { id: "executive-alerts", label: "Alertas", icon: BellRing },
  { id: "executive-watchers", label: "Monitorização", icon: Radar },
  { id: "executive-timeline", label: "Linha do tempo", icon: Activity },
  { id: "site-builder", label: "Criador de sites", icon: Globe2 },
  { id: "autonomous-improvement", label: "Autoevolução", icon: BrainCircuit },
  { id: "marketing", label: "Marketing", icon: Megaphone },
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

export function ExecutiveSidebar({
  activeSection,
  onSectionChange,
  mobileOpen = false,
  onMobileClose,
}: ExecutiveSidebarProps) {
  const handleSelect = (section: WorkspaceSection) => {
    onSectionChange(section);
    onMobileClose?.();
  };

  const content = (
    <nav className="flex min-h-full flex-col bg-[#070a0f] p-4 text-white">
      <div className="mb-6 flex items-center gap-3 px-2 pt-1">
        <span className="relative flex size-10 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-300/[.06] text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,.08)]">
          <BrainCircuit className="size-[18px]" strokeWidth={1.7} />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-[#070a0f] bg-emerald-300" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">SF Growth AI</p>
          <p className="mt-0.5 text-[9px] tracking-[0.08em] text-white/30">Executive command center</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {PRIMARY_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
                active
                  ? "border-cyan-200/15 bg-white/[.075] text-white shadow-[0_10px_30px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.05)]"
                  : "border-transparent text-white/48 hover:border-white/[.06] hover:bg-white/[.035] hover:text-white/82",
              )}
            >
              <span className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl border transition",
                active
                  ? "border-cyan-200/15 bg-cyan-300/[.08] text-cyan-100"
                  : "border-white/[.06] bg-white/[.025] text-white/38 group-hover:text-white/70",
              )}>
                <item.icon className="size-4" strokeWidth={1.65} />
              </span>
              <span className="min-w-0">
                <strong className="block text-[11px] font-semibold tracking-[0.02em]">{item.label}</strong>
                <small className="mt-0.5 block truncate text-[9px] font-normal text-white/28">{item.description}</small>
              </span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.7)]" />}
            </button>
          );
        })}
      </div>

      <details className="group mt-5 rounded-2xl border border-white/[.055] bg-white/[.018]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-[10px] font-medium text-white/38 transition hover:text-white/68">
          <span>Recursos avançados</span>
          <ChevronDown className="size-3.5 transition group-open:rotate-180" />
        </summary>
        <div className="max-h-[42dvh] space-y-0.5 overflow-y-auto border-t border-white/[.05] p-2">
          {ADVANCED_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[10px] transition",
                  active ? "bg-white/[.07] text-white" : "text-white/34 hover:bg-white/[.035] hover:text-white/64",
                )}
              >
                <item.icon className="size-3.5 shrink-0" strokeWidth={1.6} />
                {item.label}
              </button>
            );
          })}
        </div>
      </details>

      <div className="mt-auto space-y-2 pt-5">
        <Link
          href="/integrations"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-[9px] text-white/30 transition hover:bg-white/[.035] hover:text-white/60"
        >
          <span>Integrações e configuração</span>
          <span aria-hidden="true">→</span>
        </Link>
        <div className="rounded-2xl border border-white/[.055] bg-white/[.025] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] uppercase tracking-[.16em] text-white/24">Samuel Runtime</p>
              <p className="mt-1 text-[10px] font-medium text-white/62">Operacional</p>
            </div>
            <span className="flex items-center gap-1.5 text-[8px] text-emerald-200/70">
              <span className="size-1.5 rounded-full bg-emerald-300" /> online
            </span>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[272px] shrink-0 border-r border-white/[.055] bg-[#070a0f]/98 shadow-[12px_0_40px_rgba(0,0,0,.22)] backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">{content}</div>
      </aside>
    </>
  );
}
