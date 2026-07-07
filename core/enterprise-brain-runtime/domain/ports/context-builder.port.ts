import type { EnterpriseBrainContext } from "../entities";
import type { CompanyId, OrganizationId } from "../../shared";
import type { DataSourceContribution } from "./brain-repository.port";

export interface EnterpriseBrainContextBuilder {
  build(
    organizationId: OrganizationId,
    companyId: CompanyId,
    contributions: DataSourceContribution[],
  ): Promise<EnterpriseBrainContext>;
}
