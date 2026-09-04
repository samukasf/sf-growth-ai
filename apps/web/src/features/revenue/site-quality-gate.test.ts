import { describe, expect, it } from "vitest";
import { buildPremiumSiteDirection } from "./site-creative-director";
import { evaluatePremiumSite } from "./site-quality-gate";

describe("Revenue premium website system", () => {
  it("selects vertical-specific references and sections", () => {
    const direction = buildPremiumSiteDirection({ companyName: "Test", vertical: "restaurant", language: "pt", audience: "local diners", primaryGoal: "reservations", differentiators: [], proof: [], availableAssets: [] });
    expect(direction.references.some((ref) => ref.name.includes("Restaurants"))).toBe(true);
    expect(direction.requiredSections).toContain("signature dishes");
    expect(direction.qualityBar).toBe("bespoke-agency");
  });

  it("blocks fake content and incomplete experiences", () => {
    const result = evaluatePremiumSite({ usesRealBusinessData: true, hasOriginalConcept: true, responsive: true, accessible: true, reducedMotion: true, optimizedMedia: true, hasClearPrimaryCta: true, hasProof: true, hasFakeContent: true, brokenLinks: 0, consoleErrors: 0 });
    expect(result.passed).toBe(false);
    expect(result.blockers.join(" ")).toContain("Fake");
  });

  it("passes a complete premium implementation", () => {
    const result = evaluatePremiumSite({ usesRealBusinessData: true, hasOriginalConcept: true, responsive: true, accessible: true, reducedMotion: true, optimizedMedia: true, hasClearPrimaryCta: true, hasProof: true, hasFakeContent: false, brokenLinks: 0, consoleErrors: 0, lighthouse: { performance: 90, accessibility: 95, bestPractices: 95, seo: 90 } });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });
});
