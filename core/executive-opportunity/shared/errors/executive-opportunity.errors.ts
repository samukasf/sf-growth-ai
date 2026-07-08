export class ExecutiveOpportunityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutiveOpportunityError";
  }
}

export class OpportunityNotFoundError extends ExecutiveOpportunityError {
  constructor(opportunityId: string) {
    super(`Opportunity not found: ${opportunityId}`);
    this.name = "OpportunityNotFoundError";
  }
}
