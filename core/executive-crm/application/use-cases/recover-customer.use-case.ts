import { CustomerNotFoundError } from "../../shared";
import { createCustomerRecoveredEvent } from "../../domain";
import type { RecoverCustomerDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class RecoverCustomerUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: RecoverCustomerDto) {
    const customer = await this.deps.customerRepository.findById(dto.customerId);
    if (!customer) throw new CustomerNotFoundError(dto.customerId);

    const recovered = customer.recover();
    await this.deps.customerRepository.save(recovered);
    await this.deps.eventDispatcher.publish(createCustomerRecoveredEvent(recovered));

    return recovered;
  }
}
