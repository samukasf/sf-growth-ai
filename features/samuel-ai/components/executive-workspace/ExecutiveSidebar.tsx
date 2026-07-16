"use client";

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
  ChartNoAxesCombined,
  CircleDollarSign,
  Globe2,
  Gauge,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Radar,
  Scale,
  Search,
  ShieldCheck,
  UsersRound,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/utils/cn";

import {
  WORKSPACE_GROUP_LABELS,
  WORKSPACE_NAV_ITEMS,
  type WorkspaceNavGroup,
  type WorkspaceSection,
} from "./workspace-navigation";

type ExecutiveSidebarProps = {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const GROUP_ORDER: WorkspaceNavGroup[] = [
  "core",
  "executive",
  "modules",
  "integrations",
];

const NAV_ICONS: Partial<Record<WorkspaceSection, LucideIcon>> = {
  "executive-inbox": Inbox,
  dashboard: LayoutDashboard,
  "samuel-ai": Bot,
  "autonomous-improvement": BrainCircuit,
  studio: WandSparkles,
  "site-builder": Globe2,
  "executive-alerts": BellRing,
  "executive-timeline": Activity,
  "executive-agenda": CalendarDays,
  "executive-tasks": ShieldCheck,
  "executive-watchers": Radar,
  marketing: Megaphone,
  crm: BriefcaseBusiness,
  sales: BriefcaseBusiness,
  finance: CircleDollarSign,
  operations: Gauge,
  hr: UsersRound,
  legal: Scale,
  "google-business": Building2,
  "google-analytics": BarChart3,
  "search-console": Search,
  meta: ChartNoAxesCombined,
  linkedin: UsersRound,
};

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
    <nav className="flex min-h-full flex-col gap-5 p-4 text-blue-950">
      <div className="hidden rounded-2xl border border-blue-950/10 bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 lg:block">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-blue-300/15 bg-blue-400/10 text-blue-300">
            <BrainCircuit className="size-[18px]" strokeWidth={1.7} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-800">
              Command Center
            </p>
            <p className="mt-0.5 text-[10px] text-blue-950/45">Navegação executiva</p>
          </div>
        </div>
      </div>

      {GROUP_ORDER.map((group) => {
        const items = WORKSPACE_NAV_ITEMS.filter((item) => item.group === group);
        if (items.length === 0) return null;

        return (
          <div key={group}>
            <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-950/35">
              {WORKSPACE_GROUP_LABELS[group]}
            </p>
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = NAV_ICONS[item.id] ?? LayoutDashboard;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-blue-50 text-blue-800 ring-1 ring-blue-200 shadow-[inset_3px_0_0_#2563eb]"
                          : "text-blue-950/50 hover:bg-blue-50 hover:text-blue-800",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition",
                          isActive ? "text-blue-600" : "text-blue-950/35 group-hover:text-blue-600",
                        )}
                        strokeWidth={1.7}
                      />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="mt-auto rounded-2xl border border-blue-950/[0.08] bg-blue-50/70 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-950/45">Samuel Runtime</span>
          <span className="flex items-center gap-1.5 text-[9px] text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" /> online
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-blue-950/[0.07]">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[270px] shrink-0 border-r border-blue-950/[0.07] bg-white/95 shadow-[8px_0_30px_rgba(15,45,100,.04)] backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">{content}</div>
      </aside>
    </>
  );
}
