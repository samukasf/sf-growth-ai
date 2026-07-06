import type { CompanyBrainPort } from "../../application/ports/integration";

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  async enrichContext(_query: string, companyId: string): Promise<Record<string, unknown>> {
    return {
      companyId,
      source: "noop-company-brain",
      enriched: false,
    };
  }
}
