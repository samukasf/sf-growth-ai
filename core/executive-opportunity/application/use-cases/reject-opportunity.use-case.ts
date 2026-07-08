import {
  createOpportunityRejectedEvent,
  type OpportunityResult,
  type RejectOpportunityInput,
} from "../../domain";
import { OpportunityNotFoundError } from "../../shared";
import type { ExecutiveOpportunityDependencies } from "../dependencies";

export class RejectOpportunityUseCase {
  constructor(private readonly deps: ExecutiveOpportunityDependencies) {}

  async execute(input: RejectOpportunityInput): Promise<OpportunityResult> {
    const opportunity = await this.deps.repository.findOpportunityById(input.opportunityId);
    if (!opportunity) throw new OpportunityNotFoundError(input.opportunityId);

    const rejected = opportunity.withStatus("rejected");
    await this.deps.repository.saveOpportunity(rejected);
    await this.deps.eventDispatcher.publish(
      createOpportunityRejectedEvent(rejected, input.rejectedBy, input.reason),
    );

    const result = await this.deps.repository.findResultByOpportunity(rejected.id);
    return result!;
  }
}
