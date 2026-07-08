import {
  createOpportunityExecutedEvent,
  type ExecuteOpportunityInput,
  type OpportunityResult,
} from "../../domain";
import { OpportunityNotFoundError } from "../../shared";
import type { ExecutiveOpportunityDependencies } from "../dependencies";

export class ExecuteOpportunityUseCase {
  constructor(private readonly deps: ExecutiveOpportunityDependencies) {}

  async execute(input: ExecuteOpportunityInput): Promise<OpportunityResult> {
    const opportunity = await this.deps.repository.findOpportunityById(input.opportunityId);
    if (!opportunity) throw new OpportunityNotFoundError(input.opportunityId);

    const executed = opportunity.withStatus("executed");
    await this.deps.repository.saveOpportunity(executed);
    await this.deps.eventDispatcher.publish(
      createOpportunityExecutedEvent(executed, input.executedBy),
    );

    const result = await this.deps.repository.findResultByOpportunity(executed.id);
    return result!;
  }
}
