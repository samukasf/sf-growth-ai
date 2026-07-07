import type {
  RunAssessmentInput,
  RunAssessmentResult,
  StartAssessmentInput,
  StartAssessmentResult,
  AssessmentEngine,
  AssessmentResult,
} from "../../domain";
import type { AssessmentId, CompanyId } from "../../shared";
import type { EnterpriseAssessmentDependencies } from "../dependencies";
import { RunAssessmentUseCase, StartAssessmentUseCase } from "../use-cases";

export class AssessmentEngineService implements AssessmentEngine {
  private readonly startUseCase: StartAssessmentUseCase;
  private readonly runUseCase: RunAssessmentUseCase;

  constructor(private readonly deps: EnterpriseAssessmentDependencies) {
    this.startUseCase = new StartAssessmentUseCase(deps);
    this.runUseCase = new RunAssessmentUseCase(deps);
  }

  startAssessment(input: StartAssessmentInput): Promise<StartAssessmentResult> {
    return this.startUseCase.execute(input);
  }

  runAssessment(input: RunAssessmentInput): Promise<RunAssessmentResult> {
    return this.runUseCase.execute(input);
  }

  getResult(assessmentId: AssessmentId): Promise<AssessmentResult | null> {
    return this.deps.repository.findResultByAssessment(assessmentId);
  }

  async getLatestByCompany(companyId: CompanyId): Promise<AssessmentResult | null> {
    const assessments = await this.deps.repository.findAssessmentsByCompany(companyId);
    const completed = assessments
      .filter((a) => a.status === "completed")
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    if (completed.length === 0) return null;
    return this.getResult(completed[0].id);
  }
}
