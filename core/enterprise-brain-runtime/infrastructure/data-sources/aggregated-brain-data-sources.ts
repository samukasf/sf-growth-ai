import type { BrainDataSources, DataSourceContribution } from "../../domain/ports/brain-repository.port";
import type { DataSourceKey } from "../../shared";

export type DataSourceAdapter = {
  key: DataSourceKey;
  fetch(organizationId: string, companyId: string): Promise<DataSourceContribution>;
};

export class AggregatedBrainDataSources implements BrainDataSources {
  constructor(private readonly adapters: DataSourceAdapter[]) {}

  async fetchAll(organizationId: string, companyId: string) {
    return Promise.all(
      this.adapters.map((adapter) => adapter.fetch(organizationId, companyId)),
    );
  }
}
