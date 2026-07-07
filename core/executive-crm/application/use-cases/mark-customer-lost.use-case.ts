import { CustomerNotFoundError } from "../../shared";
import { createCustomerLostEvent } from "../../domain";
import type { MarkCustomerLostDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class MarkCustomerLostUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: MarkCustomerLostDto) {
    const customer = await this.deps.customerRepository.findById(dto.customerId);
    if (!customer) throw new CustomerNotFoundError(dto.customerId);

    const lost = customer.markLost();
    await this.deps.customerRepository.save(lost);
    await this.deps.eventDispatcher.publish(createCustomerLostEvent(lost, dto.reason));

    return lost;
  }
}
