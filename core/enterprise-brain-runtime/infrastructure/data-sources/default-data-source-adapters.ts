import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";
import type { DataSourceKey } from "../../shared";
import type { DataSourceAdapter } from "./aggregated-brain-data-sources";

function createSimulatedAdapter(
  key: DataSourceKey,
  label: string,
  recordCount: number,
): DataSourceAdapter {
  return {
    key,
    async fetch(organizationId, companyId): Promise<DataSourceContribution> {
      return {
        source: key,
        available: true,
        recordCount,
        summary: `${label} data for ${companyId}`,
        highlights: [`${recordCount} ${label.toLowerCase()} records`, `org: ${organizationId}`],
        context: { domain: key, label },
        healthScore: 70 + (recordCount % 20),
      };
    },
  };
}

export const DEFAULT_DATA_SOURCE_ADAPTERS: DataSourceAdapter[] = [
  createSimulatedAdapter("enterprise_memory", "Enterprise Memory", 12),
  createSimulatedAdapter("executive_knowledge", "Executive Knowledge", 8),
  createSimulatedAdapter("executive_learning", "Executive Learning", 5),
  createSimulatedAdapter("executive_experience", "Executive Experience", 6),
  createSimulatedAdapter("executive_wisdom", "Executive Wisdom", 4),
  createSimulatedAdapter("organization", "Organization", 3),
  createSimulatedAdapter("company", "Company", 2),
  createSimulatedAdapter("departments", "Departments", 7),
  createSimulatedAdapter("projects", "Projects", 9),
  createSimulatedAdapter("crm", "CRM", 15),
  createSimulatedAdapter("communication", "Communication", 11),
  createSimulatedAdapter("automation", "Automation", 6),
  createSimulatedAdapter("commerce", "Commerce", 10),
  createSimulatedAdapter("scheduling", "Scheduling", 8),
];
