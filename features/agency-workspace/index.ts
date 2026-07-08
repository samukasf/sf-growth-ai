export { AgencyWorkspace, ClientOnboardingFlow } from "./components";
export { buildAgencyWorkspace } from "./services/build-agency-workspace.service";
export { onboardNewClient, mergeOnboardingIntoWorkspace } from "./services/onboard-client.service";
export { onboardClientAction } from "./actions/onboard-client.action";
export type { AgencyWorkspaceData, CompanyBrainSnapshot, CompanyDashboardSnapshot } from "./types/agency-workspace.types";
export type {
  NewClientFormInput,
  ClientOnboardingResult,
  OnboardClientContext,
} from "./types/client-onboarding.types";
export {
  AGENCY_WORKSPACE_NAV,
  getAgencySectionLabel,
  type AgencyWorkspaceSection,
} from "./navigation/workspace-navigation";
