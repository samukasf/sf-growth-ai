import { describe, expect, it } from "vitest";

import { buildSkillExecutionPlan } from "./skill-executor";

describe("Samuel skill executor", () => {
  it("connects company research to the verified company analysis API", () => {
    const plan = buildSkillExecutionPlan({
      skillId: "research-company",
      autonomy: 0,
      companyId: "company-1",
      input: { companyName: "Example" },
    });
    expect(plan).toMatchObject({
      status: "ready",
      endpoint: "/api/company/analyze",
      method: "POST",
    });
  });

  it("keeps lead discovery blocked until the Google Maps key is configured", () => {
    const plan = buildSkillExecutionPlan({
      skillId: "find-local-businesses",
      autonomy: 0,
      companyId: "company-1",
      input: { query: "transportadoras em Lisboa" },
    });
    expect(plan.status).toBe("blocked");
    expect(plan.reason).toContain("google_maps_api_key");
  });

  it("connects lead discovery to Google Places when its requirement is satisfied", () => {
    const plan = buildSkillExecutionPlan({
      skillId: "find-local-businesses",
      autonomy: 0,
      companyId: "company-1",
      input: { query: "transportadoras em Lisboa" },
      satisfiedRequirements: ["google_maps_api_key"],
    });
    expect(plan).toMatchObject({
      status: "ready",
      endpoint: "/api/integrations/google/maps/search",
      method: "POST",
    });
  });

  it("keeps approval gate before premium website execution", () => {
    const plan = buildSkillExecutionPlan({
      skillId: "create-premium-website",
      autonomy: 1,
      approved: false,
      companyId: "company-1",
      input: {},
    });
    expect(plan.status).toBe("approval_required");
  });
});
