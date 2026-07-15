"use client";

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
  "principal",
  "workspace",
  "executive",
  "modules",
  "integrations",
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
    <nav className="flex flex-col gap-4 p-4">
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 shadow-[0_0_35px_rgba(34,211,238,0.08)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
          SF GROWTH AI
        </p>
        <p className="mt-1 text-xs text-muted">Samuel Executive OS</p>
      </div>

      {GROUP_ORDER.map((group) => {
        const items = WORKSPACE_NAV_ITEMS.filter((item) => item.group === group);
        if (items.length === 0) return null;

        return (
          <div key={group}>
            <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-wider text-muted">
              {WORKSPACE_GROUP_LABELS[group]}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-200",
                        isActive
                          ? "bg-cyan-400/10 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.12)] ring-1 ring-cyan-300/25"
                          : "text-muted hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
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
          "fixed inset-y-0 left-0 z-50 w-[280px] shrink-0 border-r border-cyan-300/[0.08] bg-[#030712]/90 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">{content}</div>
      </aside>
    </>
  );
}
