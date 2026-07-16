import { describe, expect, it } from "vitest";

import {
  hasCrmSourceData,
  hasFinanceSourceData,
  hasHrSourceData,
  hasLegalSourceData,
  hasMarketingSourceData,
  hasOperationsSourceData,
  hasSalesSourceData,
} from "./real-data-gates";

describe("Samuel AI real-data gates", () => {
  it("does not activate business modules for empty provider responses", () => {
    expect(hasCrmSourceData({ contacts: [], leads: [], deals: [] })).toBe(false);
    expect(hasMarketingSourceData({ campaigns: [], marketingScore: null })).toBe(false);
    expect(hasSalesSourceData({ deals: [], leads: [], salesScore: null })).toBe(false);
    expect(
      hasFinanceSourceData({
        revenues: [],
        expenses: [],
        invoices: [],
        bankAccounts: [],
        recurringPayments: [],
        financeScore: null,
      }),
    ).toBe(false);
    expect(hasOperationsSourceData({ tasks: [], operationsScore: null })).toBe(false);
    expect(
      hasHrSourceData({
        members: [],
        profiles: [],
        insights: [],
        employeeCount: null,
        hrScore: null,
      }),
    ).toBe(false);
    expect(
      hasLegalSourceData({
        insights: [],
        contracts: [],
        legalTwin: null,
        legalScore: null,
      }),
    ).toBe(false);
  });

  it("activates a module when a verified provider returns a real record or score", () => {
    expect(hasCrmSourceData({ contacts: [{ id: "c1" }] as never[] })).toBe(true);
    expect(hasMarketingSourceData({ campaigns: [], marketingScore: 0 })).toBe(true);
    expect(hasSalesSourceData({ deals: [], leads: [], salesScore: 72 })).toBe(true);
    expect(hasFinanceSourceData({ bankAccounts: [{ id: "b1" }] as never[] })).toBe(true);
    expect(hasOperationsSourceData({ tasks: [{ id: "t1" }] as never[] })).toBe(true);
    expect(hasHrSourceData({ employeeCount: 1 })).toBe(true);
    expect(hasLegalSourceData({ legalTwin: { complianceScore: 80 } })).toBe(true);
  });
});
