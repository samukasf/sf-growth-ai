import type { CouncilSpecialistRole } from "../../shared";

export type CouncilRoutingContext = {
  query: string;
  risks: string[];
  opportunities: string[];
  priorities: string[];
  suggestedRoles?: CouncilSpecialistRole[];
};

export interface CouncilMemberSelector {
  select(context: CouncilRoutingContext): CouncilSpecialistRole[];
}
