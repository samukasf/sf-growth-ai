import { describe, expect, it } from "vitest";
import { calculateLeadScore } from "./lead-score";
import { canExecuteRevenueAction, routeRevenueIntent, shouldStopSequence } from "./revenue-orchestrator";

describe("Revenue Agent Phase 1", () => {
  it("calculates an explainable score between 0 and 100", () => {
    const result = calculateLeadScore({ icpFit: 1, apparentNeed: .8, buyingCapacity: .6, intentSignals: .7, digitalOpportunity: .9, solutionGap: .8, recentActivity: .5, contactability: 1 });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.explanation).toHaveLength(3);
    expect(result.nextBestAction.length).toBeGreaterThan(0);
  });

  it("routes specialized work to the correct agent", () => {
    expect(routeRevenueIntent("find_leads")).toBe("market");
    expect(routeRevenueIntent("negotiate")).toBe("closer");
    expect(routeRevenueIntent("daily_brief")).toBe("revenue_manager");
  });

  it("never grants high-risk commercial actions automatically", () => {
    expect(canExecuteRevenueAction("grant_discount", 3, true).allowed).toBe(false);
    expect(canExecuteRevenueAction("change_ad_budget", 3, true).requiresHumanApproval).toBe(true);
  });

  it("stops outreach on reply, opt-out, won or unqualified", () => {
    expect(shouldStopSequence("reply")).toBe(true);
    expect(shouldStopSequence("opt_out")).toBe(true);
    expect(shouldStopSequence("won")).toBe(true);
    expect(shouldStopSequence("unqualified")).toBe(true);
    expect(shouldStopSequence("none")).toBe(false);
  });
});
