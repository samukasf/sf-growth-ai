import {
  createOpportunityApprovedEvent,
  type ApproveOpportunityInput,
  type OpportunityResult,
} from "../../domain";
import { OpportunityNotFoundError } from "../../shared";
import type { ExecutiveOpportunityDependencies } from "../dependencies";

export class ApproveOpportunityUseCase {
  constructor(private readonly deps: ExecutiveOpportunityDependencies) {}

  async execute(input: ApproveOpportunityInput): Promise<OpportunityResult> {
    const opportunity = await this.deps.repository.findOpportunityById(input.opportunityId);
    if (!opportunity) throw new OpportunityNotFoundError(input.opportunityId);

    const approved = opportunity.withStatus("approved");
    await this.deps.repository.saveOpportunity(approved);
    await this.deps.eventDispatcher.publish(
      createOpportunityApprovedEvent(approved, input.approvedBy),
    );

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.submitForCouncilReview(
        approved.organizationId,
        approved.companyId,
        approved.toJSON(),
      );
    }

    const plan = await this.deps.repository.findExecutionPlanByOpportunity(approved.id);
    if (this.deps.executiveProjects.isAvailable() && plan) {
      await this.deps.executiveProjects.createProjectFromOpportunity(
        approved.organizationId,
        approved.companyId,
        approved.toJSON(),
        plan.toJSON(),
      );
    }

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.deliverOpportunityBriefing(
        approved.organizationId,
        approved.companyId,
        { opportunity: approved.toJSON(), approvedBy: input.approvedBy },
      );
    }

    const result = await this.deps.repository.findResultByOpportunity(approved.id);
    return result!;
  }
}
