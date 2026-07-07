export class EnterpriseOsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnterpriseOsDomainError";
  }
}

export class PlatformNotFoundError extends EnterpriseOsDomainError {
  constructor(platformId: string) {
    super(`Platform not found: ${platformId}`);
    this.name = "PlatformNotFoundError";
  }
}

export class CapabilityNotFoundError extends EnterpriseOsDomainError {
  constructor(capabilityId: string) {
    super(`Capability not found: ${capabilityId}`);
    this.name = "CapabilityNotFoundError";
  }
}

export class WorkflowNotFoundError extends EnterpriseOsDomainError {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`);
    this.name = "WorkflowNotFoundError";
  }
}

export class EnterpriseOsValidationError extends EnterpriseOsDomainError {
  constructor(message: string) {
    super(message);
    this.name = "EnterpriseOsValidationError";
  }
}
