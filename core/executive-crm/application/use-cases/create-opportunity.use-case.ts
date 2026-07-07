import { CustomerNotFoundError } from "../../shared";
import { Opportunity, createOpportunityCreatedEvent } from "../../domain";
import type { CreateOpportunityDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class CreateOpportunityUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: CreateOpportunityDto) {
    const customer = await this.deps.customerRepository.findById(dto.customerId);
    if (!customer) throw new CustomerNotFoundError(dto.customerId);

    const opportunity = Opportunity.create({
      organizationId: dto.organizationId,
      customerId: dto.customerId,
      title: dto.title,
      description: dto.description,
      value: dto.value,
      currency: dto.currency,
      stageId: dto.stageId,
      expectedCloseDate: dto.expectedCloseDate,
      ownerId: dto.ownerId,
    });

    await this.deps.opportunityRepository.save(opportunity);
    await this.deps.eventDispatcher.publish(createOpportunityCreatedEvent(opportunity));

    return opportunity;
  }
}
