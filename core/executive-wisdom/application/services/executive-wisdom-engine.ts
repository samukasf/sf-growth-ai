import type {
  CreateExecutiveWisdomDto,
  GeneratePlaybookDto,
  RecordLessonDto,
  UpdateExecutiveWisdomDto,
  ValidateRecommendationDto,
} from "../dto";
import type { ExecutiveWisdomEngineDependencies } from "../dependencies";
import {
  CreateExecutiveWisdomUseCase,
  DeriveWisdomArtifactsUseCase,
  GeneratePlaybookUseCase,
  RecordLessonUseCase,
  UpdateExecutiveWisdomUseCase,
  ValidateRecommendationUseCase,
} from "../use-cases";

export class ExecutiveWisdomEngine {
  private readonly createUseCase: CreateExecutiveWisdomUseCase;
  private readonly updateUseCase: UpdateExecutiveWisdomUseCase;
  private readonly generatePlaybookUseCase: GeneratePlaybookUseCase;
  private readonly recordLessonUseCase: RecordLessonUseCase;
  private readonly validateRecommendationUseCase: ValidateRecommendationUseCase;
  private readonly deriveArtifactsUseCase: DeriveWisdomArtifactsUseCase;

  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {
    this.createUseCase = new CreateExecutiveWisdomUseCase(deps);
    this.updateUseCase = new UpdateExecutiveWisdomUseCase(deps);
    this.generatePlaybookUseCase = new GeneratePlaybookUseCase(deps);
    this.recordLessonUseCase = new RecordLessonUseCase(deps);
    this.validateRecommendationUseCase = new ValidateRecommendationUseCase(deps);
    this.deriveArtifactsUseCase = new DeriveWisdomArtifactsUseCase(deps);
  }

  createWisdom(dto: CreateExecutiveWisdomDto) {
    return this.createUseCase.execute(dto);
  }

  updateWisdom(dto: UpdateExecutiveWisdomDto) {
    return this.updateUseCase.execute(dto);
  }

  generatePlaybook(dto: GeneratePlaybookDto) {
    return this.generatePlaybookUseCase.execute(dto);
  }

  recordLesson(dto: RecordLessonDto) {
    return this.recordLessonUseCase.execute(dto);
  }

  validateRecommendation(dto: ValidateRecommendationDto) {
    return this.validateRecommendationUseCase.execute(dto);
  }

  deriveArtifacts(companyId: string) {
    return this.deriveArtifactsUseCase.execute(companyId);
  }

  async analyzeWisdom(wisdomId: string) {
    const wisdom = await this.deps.repository.findWisdomById(wisdomId);
    if (!wisdom) return null;
    return this.deps.analyzer.analyze(wisdom);
  }

  async getExperienceAggregation(companyId: string) {
    const wisdomItems = await this.deps.repository.findWisdomByCompany(companyId);
    const experiences = await this.deps.repository.findExperiencesByCompany(companyId);
    return this.deps.experienceAggregator.aggregate(companyId, wisdomItems, experiences);
  }
}
