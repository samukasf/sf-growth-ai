export type WorkspaceSection =
  | "dashboard"
  | "samuel-ai"
  | "crm"
  | "funnels"
  | "campaigns"
  | "automation"
  | "whatsapp"
  | "analytics"
  | "agents"
  | "integrations"
  | "settings"
  | "executive-inbox"
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

export type WorkspaceNavGroup =
  | "principal"
  | "workspace"
  | "executive"
  | "modules"
  | "integrations";

export type WorkspaceNavItem = {
  id: WorkspaceSection;
  label: string;
  group: WorkspaceNavGroup;
  icon?: string;
};

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { id: "dashboard", label: "Dashboard", group: "principal" },
  { id: "samuel-ai", label: "Conversa com IA", group: "principal" },
  { id: "crm", label: "CRM Inteligente", group: "workspace" },
  { id: "funnels", label: "Funis de Vendas", group: "workspace" },
  { id: "campaigns", label: "Campanhas", group: "workspace" },
  { id: "automation", label: "Automação", group: "workspace" },
  { id: "whatsapp", label: "WhatsApp", group: "workspace" },
  { id: "analytics", label: "Análises", group: "workspace" },
  { id: "agents", label: "Agentes IA", group: "workspace" },
  { id: "integrations", label: "Integrações", group: "workspace" },
  { id: "settings", label: "Configurações", group: "workspace" },
  { id: "executive-inbox", label: "Executive Inbox", group: "executive" },
  { id: "executive-alerts", label: "Executive Alerts", group: "executive" },
  { id: "executive-timeline", label: "Executive Timeline", group: "executive" },
  { id: "executive-agenda", label: "Executive Agenda", group: "executive" },
  { id: "executive-tasks", label: "Executive Tasks", group: "executive" },
  { id: "executive-watchers", label: "Executive Watchers", group: "executive" },
  { id: "marketing", label: "Marketing", group: "modules" },
  { id: "sales", label: "Sales", group: "modules" },
  { id: "finance", label: "Finance", group: "modules" },
  { id: "operations", label: "Operations", group: "modules" },
  { id: "hr", label: "HR", group: "modules" },
  { id: "legal", label: "Legal", group: "modules" },
  { id: "google-business", label: "Google Business", group: "integrations" },
  { id: "google-analytics", label: "Google Analytics", group: "integrations" },
  { id: "search-console", label: "Search Console", group: "integrations" },
  { id: "meta", label: "Meta", group: "integrations" },
  { id: "linkedin", label: "LinkedIn", group: "integrations" },
];

export const WORKSPACE_GROUP_LABELS: Record<WorkspaceNavGroup, string> = {
  principal: "Principal",
  workspace: "Sistema",
  executive: "Executivo",
  modules: "Módulos",
  integrations: "Integrações",
};

export function getWorkspaceSectionLabel(section: WorkspaceSection): string {
  return WORKSPACE_NAV_ITEMS.find((item) => item.id === section)?.label ?? section;
}
