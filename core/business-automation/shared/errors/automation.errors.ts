export class AutomationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutomationDomainError";
  }
}

export class AutomationNotFoundError extends AutomationDomainError {
  constructor(automationId: string) {
    super(`Automation not found: ${automationId}`);
    this.name = "AutomationNotFoundError";
  }
}

export class WorkflowNotFoundError extends AutomationDomainError {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`);
    this.name = "WorkflowNotFoundError";
  }
}

export class AutomationValidationError extends AutomationDomainError {
  constructor(message: string) {
    super(message);
    this.name = "AutomationValidationError";
  }
}
