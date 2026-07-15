export type WorkspaceSection =
  | "executive-inbox"
  | "dashboard"
  | "samuel-ai"
  | "executive-alerts"
  | "executive-timeline"
  | "executive-agenda"
  | "executive-tasks"
  | "executive-watchers"
  | "marketing"
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

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { id: "dashboard", label: "Início", group: "core" },
  { id: "samuel-ai", label: "Conversar com Samuel", group: "core" },
  { id: "executive-inbox", label: "Executive Inbox", group: "core" },
  { id: "executive-alerts", label: "Alertas executivos", group: "executive" },
  { id: "executive-timeline", label: "Linha do tempo", group: "executive" },
  { id: "executive-agenda", label: "Agenda executiva", group: "executive" },
  { id: "executive-tasks", label: "Tarefas e decisões", group: "executive" },
  { id: "executive-watchers", label: "Monitorização", group: "executive" },
  { id: "marketing", label: "Marketing", group: "modules" },
  { id: "sales", label: "Vendas e CRM", group: "modules" },
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
  core: "Central",
  executive: "Execução",
  modules: "Áreas de negócio",
  integrations: "Integrações",
};

export function getWorkspaceSectionLabel(section: WorkspaceSection): string {
  return WORKSPACE_NAV_ITEMS.find((item) => item.id === section)?.label ?? section;
}
