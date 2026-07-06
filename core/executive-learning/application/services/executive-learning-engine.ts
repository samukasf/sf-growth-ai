import type {
  CreateLearningRecordDto,
  ProcessFeedbackDto,
  RecordExperienceDto,
  UpdateLearningRecordDto,
} from "../dto";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";
import {
  CreateLearningRecordUseCase,
  DetectPatternsUseCase,
  ProcessFeedbackUseCase,
  RecordExperienceUseCase,
  UpdateLearningRecordUseCase,
  ValidateLearningUseCase,
} from "../use-cases";

export class ExecutiveLearningEngine {
  private readonly createUseCase: CreateLearningRecordUseCase;
  private readonly updateUseCase: UpdateLearningRecordUseCase;
  private readonly recordExperienceUseCase: RecordExperienceUseCase;
  private readonly processFeedbackUseCase: ProcessFeedbackUseCase;
  private readonly detectPatternsUseCase: DetectPatternsUseCase;
  private readonly validateUseCase: ValidateLearningUseCase;

  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {
    this.createUseCase = new CreateLearningRecordUseCase(deps);
    this.updateUseCase = new UpdateLearningRecordUseCase(deps);
    this.recordExperienceUseCase = new RecordExperienceUseCase(deps);
    this.processFeedbackUseCase = new ProcessFeedbackUseCase(deps);
    this.detectPatternsUseCase = new DetectPatternsUseCase(deps);
    this.validateUseCase = new ValidateLearningUseCase(deps);
  }

  createRecord(dto: CreateLearningRecordDto) {
    return this.createUseCase.execute(dto);
  }

  updateRecord(dto: UpdateLearningRecordDto) {
    return this.updateUseCase.execute(dto);
  }

  recordExperience(dto: RecordExperienceDto) {
    return this.recordExperienceUseCase.execute(dto);
  }

  processFeedback(dto: ProcessFeedbackDto) {
    return this.processFeedbackUseCase.execute(dto);
  }

  detectPatterns(companyId: string) {
    return this.detectPatternsUseCase.execute(companyId);
  }

  validateLearning(recordId: string) {
    return this.validateUseCase.execute(recordId);
  }

  async getExperienceAggregation(companyId: string) {
    const records = await this.deps.repository.findRecordsByCompany(companyId);
    const experiences = (
      await Promise.all(records.map((record) => this.deps.repository.findExperiencesByRecord(record.id)))
    ).flat();

    return this.deps.experienceAggregator.aggregate(companyId, records, experiences);
  }

  async calculateScore(recordId: string) {
    const record = await this.deps.repository.findRecordById(recordId);
    if (!record) return null;
    return this.deps.scoreCalculator.calculate(record);
  }

  async analyzeRecord(recordId: string) {
    const record = await this.deps.repository.findRecordById(recordId);
    if (!record) return null;
    return this.deps.analyzer.analyze(record);
  }
}
