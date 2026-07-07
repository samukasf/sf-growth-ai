export class CrmDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrmDomainError";
  }
}

export class LeadNotFoundError extends CrmDomainError {
  constructor(leadId: string) {
    super(`Lead not found: ${leadId}`);
    this.name = "LeadNotFoundError";
  }
}

export class CustomerNotFoundError extends CrmDomainError {
  constructor(customerId: string) {
    super(`Customer not found: ${customerId}`);
    this.name = "CustomerNotFoundError";
  }
}

export class OpportunityNotFoundError extends CrmDomainError {
  constructor(opportunityId: string) {
    super(`Opportunity not found: ${opportunityId}`);
    this.name = "OpportunityNotFoundError";
  }
}

export class PipelineNotFoundError extends CrmDomainError {
  constructor(pipelineId: string) {
    super(`Pipeline not found: ${pipelineId}`);
    this.name = "PipelineNotFoundError";
  }
}

export class CrmValidationError extends CrmDomainError {
  constructor(message: string) {
    super(message);
    this.name = "CrmValidationError";
  }
}
