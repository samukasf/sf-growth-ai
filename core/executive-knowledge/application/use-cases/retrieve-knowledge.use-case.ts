import type { RetrieveKnowledgeDto } from "../dto";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";

export class RetrieveKnowledgeUseCase {
  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {}

  async execute(dto: RetrieveKnowledgeDto) {
    const records = await this.deps.repository.findByCompany(dto.companyId);
    const activeRecords = records.filter((record) => record.isActive());

    const retrieval = this.deps.retriever.retrieve(activeRecords, {
      companyId: dto.companyId,
      query: dto.query,
      limit: dto.limit,
      minRelevance: dto.minRelevance,
    });

    await this.deps.aiProvider.canHandle({
      companyId: dto.companyId,
      query: dto.query,
      contextRecords: retrieval,
    });

    return retrieval;
  }
}
