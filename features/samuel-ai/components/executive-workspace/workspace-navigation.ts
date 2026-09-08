export type WorkspaceSection =
  | "executive-inbox"
  | "dashboard"
  | "samuel-ai"
  | "autonomous-improvement"
  | "studio"
  | "site-builder"
  | "executive-alerts"
  | "executive-timeline"
  | "executive-agenda"
  | "executive-tasks"
  | "executive-watchers"
  | "marketing"
  | "crm"
  | "sales"
  | "finance"
  | "operations"
  | "hr"
  | "legal"
  | "google-business"
  | "google-analytics"
  | "search-console"
  | "meta"
  | "linkedin";

export type WorkspaceNavGroup = "core" | "executive" | "modules" | "integrations";

export type WorkspaceNavItem = {
  id: WorkspaceSection;
  label: string;
  group: WorkspaceNavGroup;
  icon?: string;
};

/**
 * The complete navigation registry is intentionally broader than the visible
 * shell. The shell exposes only the five primary workspaces and reveals the
 * rest progressively when the user needs them.
 */
export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { id: "samuel-ai", label: "Samuel", group: "core" },
  { id: "executive-inbox", label: "Work", group: "core" },
  { id: "dashboard", label: "Growth", group: "core" },
  { id: "studio", label: "Studio", group: "core" },
  { id: "crm", label: "Clients", group: "core" },
  { id: "autonomous-improvement", label: "Autoevolução", group: "executive" },
  { id: "site-builder", label: "Criador de Sites", group: "executive" },
  { id: "executive-alerts", label: "Alertas executivos", group: "executive" },
  { id: "executive-timeline", label: "Linha do tempo", group: "executive" },
  { id: "executive-agenda", label: "Agenda executiva", group: "executive" },
  { id: "executive-tasks", label: "Tarefas e decisões", group: "executive" },
  { id: "executive-watchers", label: "Monitorização", group: "executive" },
  { id: "marketing", label: "Marketing", group: "modules" },
  { id: "sales", label: "Vendas", group: "modules" },
  { id: "finance", label: "Finanças", group: "modules" },
  { id: "operations", label: "Operações", group: "modules" },
  { id: "hr", label: "Pessoas", group: "modules" },
  { id: "legal", label: "Jurídico", group: "modules" },
  { id: "google-business", label: "Google Business", group: "integrations" },
  { id: "google-analytics", label: "Google Analytics", group: "integrations" },
  { id: "search-console", label: "Search Console", group: "integrations" },
  { id: "meta", label: "Meta", group: "integrations" },
  { id: "linkedin", label: "LinkedIn", group: "integrations" },
];

export const WORKSPACE_GROUP_LABELS: Record<WorkspaceNavGroup, string> = {
  core: "Principal",
  executive: "Execução",
  modules: "Áreas de negócio",
  integrations: "Integrações",
};

export const PRIMARY_WORKSPACE_SECTIONS: WorkspaceSection[] = [
  "samuel-ai",
  "executive-inbox",
  "dashboard",
  "studio",
  "crm",
];

export function getWorkspaceSectionLabel(section: WorkspaceSection): string {
  return WORKSPACE_NAV_ITEMS.find((item) => item.id === section)?.label ?? section;
}
