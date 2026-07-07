import type { Lead, LeadScoringEngine } from "../../domain";
import type { LeadScore } from "../../shared";

export class DefaultLeadScoringEngine implements LeadScoringEngine {
  score(lead: Lead): LeadScore {
    let value = 20;
    if (lead.email.includes("@")) value += 15;
    if (lead.company) value += 20;
    if (lead.phone) value += 10;
    if (lead.source === "referral") value += 25;
    if (lead.source === "campaign") value += 15;

    value = Math.min(100, value);

    const tier: LeadScore["tier"] =
      value >= 80 ? "qualified" : value >= 60 ? "hot" : value >= 40 ? "warm" : "cold";

    return { value, tier };
  }

  isQualified(score: LeadScore): boolean {
    return score.tier === "qualified" || score.tier === "hot";
  }
}
