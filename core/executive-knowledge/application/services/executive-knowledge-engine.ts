import type { CreateKnowledgeRecordDto, LinkKnowledgeDto, RetrieveKnowledgeDto, UpdateKnowledgeRecordDto } from "../dto";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";
import {
  ArchiveKnowledgeUseCase,
  CreateKnowledgeRecordUseCase,
  LinkKnowledgeUseCase,
  RetrieveKnowledgeUseCase,
  UpdateKnowledgeRecordUseCase,
  ValidateKnowledgeUseCase,
} from "../use-cases";

export class ExecutiveKnowledgeEngine {
  private readonly createUseCase: CreateKnowledgeRecordUseCase;
  private readonly updateUseCase: UpdateKnowledgeRecordUseCase;
  private readonly validateUseCase: ValidateKnowledgeUseCase;
  private readonly linkUseCase: LinkKnowledgeUseCase;
  private readonly archiveUseCase: ArchiveKnowledgeUseCase;
  private readonly retrieveUseCase: RetrieveKnowledgeUseCase;

  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {
    this.createUseCase = new CreateKnowledgeRecordUseCase(deps);
    this.updateUseCase = new UpdateKnowledgeRecordUseCase(deps);
    this.validateUseCase = new ValidateKnowledgeUseCase(deps);
    this.linkUseCase = new LinkKnowledgeUseCase(deps);
    this.archiveUseCase = new ArchiveKnowledgeUseCase(deps);
    this.retrieveUseCase = new RetrieveKnowledgeUseCase(deps);
  }

  createRecord(dto: CreateKnowledgeRecordDto) {
    return this.createUseCase.execute(dto);
  }

  updateRecord(dto: UpdateKnowledgeRecordDto) {
    return this.updateUseCase.execute(dto);
  }

  validateRecord(recordId: string) {
    return this.validateUseCase.execute(recordId);
  }

  linkRecords(dto: LinkKnowledgeDto) {
    return this.linkUseCase.execute(dto);
  }

  archiveRecord(recordId: string) {
    return this.archiveUseCase.execute(recordId);
  }

  retrieveKnowledge(dto: RetrieveKnowledgeDto) {
    return this.retrieveUseCase.execute(dto);
  }

  findRelatedRecords(recordId: string) {
    return this.findRelated(recordId);
  }

  evaluateQuality(recordId: string) {
    return this.evaluateRecordQuality(recordId);
  }

  private async findRelated(recordId: string) {
    const record = await this.deps.repository.findById(recordId);
    if (!record) return [];

    const allRecords = await this.deps.repository.findByCompany(record.companyId);
    return this.deps.relationshipResolver.findRelated(record, allRecords);
  }

  private async evaluateRecordQuality(recordId: string) {
    const record = await this.deps.repository.findById(recordId);
    if (!record) return null;
    return this.deps.qualityEvaluator.evaluate(record);
  }
}
