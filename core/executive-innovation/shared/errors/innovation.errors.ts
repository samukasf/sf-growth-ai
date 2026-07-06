export class InnovationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InnovationDomainError";
  }
}

export class InnovationOpportunityNotFoundError extends InnovationDomainError {
  constructor(opportunityId: string) {
    super(`Innovation opportunity not found: ${opportunityId}`);
    this.name = "InnovationOpportunityNotFoundError";
  }
}

export class InnovationValidationError extends InnovationDomainError {
  constructor(message: string) {
    super(message);
    this.name = "InnovationValidationError";
  }
}
