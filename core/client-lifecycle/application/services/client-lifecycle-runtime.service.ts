import type { ClientLifecycleRuntime } from "../../domain";
import type { ClientLifecycleDependencies } from "../dependencies";
import {
  AcceptProposalUseCase,
  ActivateCompanyBrainUseCase,
  BuildTimelineUseCase,
  CompleteOnboardingUseCase,
  CreateLeadUseCase,
  DetectUpsellUseCase,
  EvaluateHealthUseCase,
  GetJourneyUseCase,
  RecoverClientUseCase,
  SuggestRenewalUseCase,
} from "../use-cases";

export class ClientLifecycleRuntimeService implements ClientLifecycleRuntime {
  private readonly createLeadUseCase: CreateLeadUseCase;
  private readonly acceptProposalUseCase: AcceptProposalUseCase;
  private readonly completeOnboardingUseCase: CompleteOnboardingUseCase;
  private readonly activateCompanyBrainUseCase: ActivateCompanyBrainUseCase;
  private readonly evaluateHealthUseCase: EvaluateHealthUseCase;
  private readonly suggestRenewalUseCase: SuggestRenewalUseCase;
  private readonly detectUpsellUseCase: DetectUpsellUseCase;
  private readonly recoverClientUseCase: RecoverClientUseCase;
  private readonly getJourneyUseCase: GetJourneyUseCase;
  private readonly buildTimelineUseCase: BuildTimelineUseCase;

  constructor(private readonly deps: ClientLifecycleDependencies) {
    this.createLeadUseCase = new CreateLeadUseCase(deps);
    this.acceptProposalUseCase = new AcceptProposalUseCase(deps);
    this.completeOnboardingUseCase = new CompleteOnboardingUseCase(deps);
    this.activateCompanyBrainUseCase = new ActivateCompanyBrainUseCase(deps);
    this.evaluateHealthUseCase = new EvaluateHealthUseCase(deps);
    this.suggestRenewalUseCase = new SuggestRenewalUseCase(deps);
    this.detectUpsellUseCase = new DetectUpsellUseCase(deps);
    this.recoverClientUseCase = new RecoverClientUseCase(deps);
    this.getJourneyUseCase = new GetJourneyUseCase(deps);
    this.buildTimelineUseCase = new BuildTimelineUseCase(deps);
  }

  async createLead(input: Parameters<ClientLifecycleRuntime["createLead"]>[0]) {
    const result = await this.createLeadUseCase.execute(input);
    return result;
  }

  async acceptProposal(agencyId: string, proposalId: string) {
    const result = await this.acceptProposalUseCase.execute(agencyId, proposalId);
    return result.proposal;
  }

  async completeOnboarding(agencyId: string, onboardingId: string) {
    const result = await this.completeOnboardingUseCase.execute(agencyId, onboardingId);
    return result.onboarding;
  }

  async activateCompanyBrain(agencyId: string, journeyId: string) {
    const result = await this.activateCompanyBrainUseCase.execute(agencyId, journeyId);
    return result.journey;
  }

  async evaluateHealth(organizationId: string, agencyId: string, companyId: string) {
    const result = await this.evaluateHealthUseCase.execute(organizationId, agencyId, companyId);
    return result.health;
  }

  async suggestRenewal(
    organizationId: string,
    agencyId: string,
    companyId: string,
    contractId: string,
  ) {
    const result = await this.suggestRenewalUseCase.execute(
      organizationId,
      agencyId,
      companyId,
      contractId,
    );
    return result.renewal;
  }

  async detectUpsell(organizationId: string, agencyId: string, companyId: string) {
    const result = await this.detectUpsellUseCase.execute(organizationId, agencyId, companyId);
    return result.upsell;
  }

  async recoverClient(agencyId: string, companyId: string) {
    const result = await this.recoverClientUseCase.execute(agencyId, companyId);
    return result.relationship;
  }

  async getJourney(agencyId: string, journeyId: string) {
    const result = await this.getJourneyUseCase.execute(agencyId, journeyId);
    return result.journey;
  }

  async buildTimeline(journeyId: string) {
    const result = await this.buildTimelineUseCase.execute(journeyId);
    return result.timeline;
  }
}
