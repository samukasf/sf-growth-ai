import type {
  CompleteBusinessCaseDto,
  DetectPatternsDto,
  MatchScenariosDto,
  RecordExecutiveExperienceDto,
  ValidateExperienceDto,
} from "../dto";
import type { ExecutiveExperienceEngineDependencies } from "../dependencies";
import {
  CompleteBusinessCaseUseCase,
  DetectPatternsUseCase,
  MatchScenariosUseCase,
  RecordExecutiveExperienceUseCase,
  ValidateExperienceUseCase,
} from "../use-cases";

export class ExecutiveExperienceEngine {
  private readonly recordUseCase: RecordExecutiveExperienceUseCase;
  private readonly completeCaseUseCase: CompleteBusinessCaseUseCase;
  private readonly validateUseCase: ValidateExperienceUseCase;
  private readonly matchScenariosUseCase: MatchScenariosUseCase;
  private readonly detectPatternsUseCase: DetectPatternsUseCase;

  constructor(private readonly deps: ExecutiveExperienceEngineDependencies) {
    this.recordUseCase = new RecordExecutiveExperienceUseCase(deps);
    this.completeCaseUseCase = new CompleteBusinessCaseUseCase(deps);
    this.validateUseCase = new ValidateExperienceUseCase(deps);
    this.matchScenariosUseCase = new MatchScenariosUseCase(deps);
    this.detectPatternsUseCase = new DetectPatternsUseCase(deps);
  }

  recordExperience(dto: RecordExecutiveExperienceDto) {
    return this.recordUseCase.execute(dto);
  }

  completeBusinessCase(dto: CompleteBusinessCaseDto) {
    return this.completeCaseUseCase.execute(dto);
  }

  validateExperience(dto: ValidateExperienceDto) {
    return this.validateUseCase.execute(dto);
  }

  matchScenarios(dto: MatchScenariosDto) {
    return this.matchScenariosUseCase.execute(dto);
  }

  detectPatterns(dto: DetectPatternsDto) {
    return this.detectPatternsUseCase.execute(dto);
  }

  async analyzeExperience(experienceId: string) {
    const experience = await this.deps.experienceRepository.findExperienceById(experienceId);
    if (!experience) return null;
    return this.deps.analyzer.analyze(experience);
  }

  async calculateScore(experienceId: string) {
    const experience = await this.deps.experienceRepository.findExperienceById(experienceId);
    if (!experience) return null;
    return this.deps.scoreCalculator.calculate(experience);
  }

  async findSimilarCases(experienceId: string) {
    const target = await this.deps.experienceRepository.findExperienceById(experienceId);
    if (!target) return [];

    const candidates = await this.deps.experienceRepository.findExperiencesByCompany(
      target.companyId,
    );
    return this.deps.patternMatcher.findSimilarCases(
      target,
      candidates.filter((item) => item.id !== target.id),
    );
  }
}
