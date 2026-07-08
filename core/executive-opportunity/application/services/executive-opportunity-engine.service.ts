import type {
  AnalyzeOpportunityInput,
  AnalyzeOpportunityResult,
  ApproveOpportunityInput,
  DetectOpportunitiesInput,
  DetectOpportunitiesResult,
  ExecuteOpportunityInput,
  ExecutiveOpportunityEngine,
  OpportunityResult,
  RejectOpportunityInput,
} from "../../domain";
import type { BusinessOpportunityId, CompanyId } from "../../shared";
import type { ExecutiveOpportunityDependencies } from "../dependencies";
import {
  AnalyzeOpportunityUseCase,
  ApproveOpportunityUseCase,
  DetectOpportunitiesUseCase,
  ExecuteOpportunityUseCase,
  RejectOpportunityUseCase,
} from "../use-cases";

export class ExecutiveOpportunityEngineService implements ExecutiveOpportunityEngine {
  private readonly detectUseCase: DetectOpportunitiesUseCase;
  private readonly analyzeUseCase: AnalyzeOpportunityUseCase;
  private readonly approveUseCase: ApproveOpportunityUseCase;
  private readonly rejectUseCase: RejectOpportunityUseCase;
  private readonly executeUseCase: ExecuteOpportunityUseCase;

  constructor(private readonly deps: ExecutiveOpportunityDependencies) {
    this.detectUseCase = new DetectOpportunitiesUseCase(deps);
    this.analyzeUseCase = new AnalyzeOpportunityUseCase(deps);
    this.approveUseCase = new ApproveOpportunityUseCase(deps);
    this.rejectUseCase = new RejectOpportunityUseCase(deps);
    this.executeUseCase = new ExecuteOpportunityUseCase(deps);
  }

  detectOpportunities(input: DetectOpportunitiesInput): Promise<DetectOpportunitiesResult> {
    return this.detectUseCase.execute(input);
  }

  analyzeOpportunity(input: AnalyzeOpportunityInput): Promise<AnalyzeOpportunityResult> {
    return this.analyzeUseCase.execute(input);
  }

  approveOpportunity(input: ApproveOpportunityInput): Promise<OpportunityResult> {
    return this.approveUseCase.execute(input);
  }

  rejectOpportunity(input: RejectOpportunityInput): Promise<OpportunityResult> {
    return this.rejectUseCase.execute(input);
  }

  executeOpportunity(input: ExecuteOpportunityInput): Promise<OpportunityResult> {
    return this.executeUseCase.execute(input);
  }

  getOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityResult | null> {
    return this.deps.repository.findResultByOpportunity(opportunityId);
  }

  async getOpportunitiesByCompany(companyId: CompanyId): Promise<OpportunityResult[]> {
    const opportunities = await this.deps.repository.findOpportunitiesByCompany(companyId);
    const results: OpportunityResult[] = [];
    for (const opp of opportunities) {
      const result = await this.deps.repository.findResultByOpportunity(opp.id);
      if (result) results.push(result);
    }
    return results;
  }
}
