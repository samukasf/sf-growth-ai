import type { CompanyBrainPort, CompanyBrainSnapshot } from "../../core/orchestrator/orchestrator.types";

export function createMockCompanyBrainPort(
  snapshot: CompanyBrainSnapshot,
): CompanyBrainPort {
  return {
    loadSnapshot: async (tenantId, companyId) => ({
      ...snapshot,
      tenantId,
      companyId,
      generatedAt: new Date().toISOString(),
    }),
  };
}
