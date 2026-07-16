import { describe, expect, it } from "vitest";

import { buildCrmExecutive } from "./crm-executive.service";

describe("buildCrmExecutive", () => {
  it("keeps the demo dataset only when no source was provided", () => {
    const demo = buildCrmExecutive({ companyName: "Empresa de demonstração" });

    expect(demo.totalContacts).toBeGreaterThan(0);
    expect(demo.totalLeads).toBeGreaterThan(0);
  });

  it("does not invent CRM records after a real empty query", () => {
    const realEmpty = buildCrmExecutive({
      contacts: [],
      leads: [],
      deals: [],
      companyName: "Empresa real",
    });

    expect(realEmpty.totalContacts).toBe(0);
    expect(realEmpty.totalLeads).toBe(0);
    expect(realEmpty.atRiskContacts).toEqual([]);
    expect(realEmpty.highPotentialContacts).toEqual([]);
  });
});
