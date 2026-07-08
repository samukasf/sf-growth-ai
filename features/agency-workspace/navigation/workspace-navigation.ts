export type AgencyWorkspaceSection =
  | "agency-overview"
  | "client-portfolio"
  | "company-brain"
  | "company-dashboard"
  | "executive-dashboard"
  | "executive-council"
  | "executive-ceo"
  | "projects"
  | "missions"
  | "opportunities"
  | "business-health";

export type AgencyNavItem = {
  id: AgencyWorkspaceSection;
  label: string;
};

export const AGENCY_WORKSPACE_NAV: AgencyNavItem[] = [
  { id: "agency-overview", label: "Agency Overview" },
  { id: "client-portfolio", label: "Client Portfolio" },
  { id: "company-brain", label: "Company Brain" },
  { id: "company-dashboard", label: "Company Dashboard" },
  { id: "executive-dashboard", label: "Executive Dashboard" },
  { id: "executive-council", label: "Executive Council" },
  { id: "executive-ceo", label: "Executive CEO" },
  { id: "projects", label: "Projects" },
  { id: "missions", label: "Missions" },
  { id: "opportunities", label: "Opportunities" },
  { id: "business-health", label: "Business Health" },
];

export function getAgencySectionLabel(section: AgencyWorkspaceSection): string {
  return AGENCY_WORKSPACE_NAV.find((item) => item.id === section)?.label ?? section;
}
