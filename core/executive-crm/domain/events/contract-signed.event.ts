import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Contract } from "../entities";

export type ContractSignedPayload = { contract: ReturnType<Contract["toJSON"]> };
export type ContractSignedEvent = DomainEvent<ContractSignedPayload>;

export function createContractSignedEvent(contract: Contract): ContractSignedEvent {
  return createDomainEvent({
    eventType: "ContractSigned",
    aggregateId: contract.id,
    organizationId: contract.organizationId,
    payload: { contract: contract.toJSON() },
  });
}
