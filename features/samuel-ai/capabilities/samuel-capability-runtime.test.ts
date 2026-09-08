import { describe, expect, it } from "vitest";

import {
  getSamuelCapability,
  listSamuelCapabilities,
} from "./samuel-capability-registry";
import { buildSamuelCapabilityExecutionPlan } from "./samuel-capability-runtime";

describe("Samuel capability runtime", () => {
  it("resolves company research to the verified production route", () => {
    const plan = buildSamuelCapabilityExecutionPlan({
      capabilityId: "research.company",
      companyId: "company-1",
      autonomy: 0,
      input: { companyName: "Example" },
    });

    expect(plan.status).toBe("ready");
    expect(plan.executor).toEqual({
      kind: "server_route",
      endpoint: "/api/company/analyze",
      method: "POST",
    });
    expect(plan.payload).toMatchObject({
      companyId: "company-1",
      companyName: "Example",
    });
  });

  it("keeps mutation capabilities behind approval", () => {
    const plan = buildSamuelCapabilityExecutionPlan({
      capabilityId: "workspace.email",
      companyId: "company-1",
      autonomy: 1,
      approved: false,
    });

    expect(plan.status).toBe("approval_required");
    expect(plan.evidencePolicy).toBe("ledger");
  });

  it("does not claim planned media or social capabilities are executable", () => {
    for (const capabilityId of [
      "creative.vector",
      "creative.video",
      "social.publish",
    ]) {
      const plan = buildSamuelCapabilityExecutionPlan({
        capabilityId,
        companyId: "company-1",
        autonomy: 3,
        approved: true,
      });
      expect(plan.status).toBe("planned");
      expect(plan.executor).toBeNull();
    }
  });

  it("exposes only verified voice-enabled capabilities", () => {
    const voiceCapabilities = listSamuelCapabilities({ voiceEnabled: true });
    expect(voiceCapabilities.length).toBeGreaterThan(0);
    expect(voiceCapabilities.every((capability) => capability.availability === "connected")).toBe(true);
  });

  it("registers desktop use with visual evidence and cancellation", () => {
    const capability = getSamuelCapability("desktop.computer");
    expect(capability).toMatchObject({
      availability: "connected",
      evidencePolicy: "visual",
      cancellable: true,
      executor: { kind: "desktop", action: "computer.task" },
    });
  });
});
