import { createContractSignedEvent } from "../../domain";
import type { SignContractDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class SignContractUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: SignContractDto) {
    const contract = await this.deps.crmRepository.findContractById(dto.contractId);
    if (!contract) throw new Error(`Contract not found: ${dto.contractId}`);

    const signed = contract.sign();
    await this.deps.crmRepository.saveContract(signed);
    await this.deps.eventDispatcher.publish(createContractSignedEvent(signed));

    return signed;
  }
}
