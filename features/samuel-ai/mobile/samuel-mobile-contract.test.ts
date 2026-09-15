import { describe, expect, it } from "vitest";

import {
  getSamuelCapability,
  listSamuelCapabilities,
} from "../capabilities/samuel-capability-registry";

describe("Samuel native mobile contract", () => {
  it("does not create a reduced Samuel capability set", () => {
    const ids = listSamuelCapabilities().map((capability) => capability.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "research.company",
        "workspace.email",
        "workspace.calendar",
        "workspace.drive",
        "desktop.computer",
        "growth.lead-discovery",
        "growth.website-audit",
        "growth.ads-analysis",
        "creative.website",
        "creative.image",
        "creative.vector",
        "creative.video",
        "sales.proposal",
        "sales.outreach",
        "sales.crm",
        "social.publish",
      ]),
    );
  });

  it("keeps computer operation and video creation voice-capable", () => {
    expect(getSamuelCapability("desktop.computer")?.voiceEnabled).toBe(true);
    expect(getSamuelCapability("creative.video")?.voiceEnabled).toBe(true);
  });

  it("keeps planned capabilities visible instead of silently deleting them", () => {
    expect(getSamuelCapability("social.publish")?.availability).toBe("planned");
    expect(getSamuelCapability("creative.website")?.availability).toBe("planned");
  });
});
