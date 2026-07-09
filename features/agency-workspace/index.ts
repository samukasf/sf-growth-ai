export { AgencyWorkspace, ClientOnboardingFlow } from "./components";
export { buildAgencyWorkspace } from "./services/build-agency-workspace.service";
export { onboardNewClient, mergeOnboardingIntoWorkspace } from "./services/onboard-client.service";
export { saveNewClient, mergeClientIntoWorkspace } from "./services/save-client.service";
export { onboardClientAction } from "./actions/onboard-client.action";
export { saveClientAction } from "./actions/save-client.action";
export type { AgencyWorkspaceData, CompanyBrainSnapshot, CompanyDashboardSnapshot } from "./types/agency-workspace.types";
export type {
  NewClientFormInput,
  SaveClientContext,
  SaveClientResult,
} from "./types/new-client.types";
export {
  AGENCY_WORKSPACE_NAV,
  getAgencySectionLabel,
  type AgencyWorkspaceSection,
} from "./navigation/workspace-navigation";
