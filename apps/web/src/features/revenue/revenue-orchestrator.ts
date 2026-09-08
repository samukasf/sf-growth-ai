import type { AutonomyLevel, RevenueAgentName } from "./revenue.types";

export type RevenueIntent =
  | "find_leads" | "research_lead" | "score_lead" | "draft_outreach" | "handle_reply"
  | "negotiate" | "create_asset" | "analyze_ads" | "update_crm" | "daily_brief";

const ROUTES: Record<RevenueIntent, RevenueAgentName> = {
  find_leads: "market",
  research_lead: "lead_research",
  score_lead: "qualification",
  draft_outreach: "outreach",
  handle_reply: "outreach",
  negotiate: "closer",
  create_asset: "creative",
  analyze_ads: "ads",
  update_crm: "crm",
  daily_brief: "revenue_manager",
};

const HIGH_RISK_ACTIONS = new Set(["send_first_contact", "change_price", "grant_discount", "sign_contract", "change_ad_budget", "publish_ads"]);

export function routeRevenueIntent(intent: RevenueIntent): RevenueAgentName {
  return ROUTES[intent];
}

export function canExecuteRevenueAction(action: string, autonomy: AutonomyLevel, preApproved = false) {
  if (HIGH_RISK_ACTIONS.has(action)) return { allowed: false, requiresHumanApproval: true };
  if (autonomy === 0) return { allowed: false, requiresHumanApproval: true };
  if (autonomy === 1) return { allowed: false, requiresHumanApproval: true };
  if (autonomy === 2) return { allowed: preApproved, requiresHumanApproval: !preApproved };
  return { allowed: preApproved, requiresHumanApproval: !preApproved };
}

export function shouldStopSequence(event: "reply" | "opt_out" | "won" | "unqualified" | "bounce" | "none") {
  return event === "reply" || event === "opt_out" || event === "won" || event === "unqualified";
}
