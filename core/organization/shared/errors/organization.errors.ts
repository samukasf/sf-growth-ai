export class OrganizationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationDomainError";
  }
}

export class OrganizationNotFoundError extends OrganizationDomainError {
  constructor(organizationId: string) {
    super(`Organization not found: ${organizationId}`);
    this.name = "OrganizationNotFoundError";
  }
}

export class MemberNotFoundError extends OrganizationDomainError {
  constructor(memberId: string) {
    super(`Organization member not found: ${memberId}`);
    this.name = "MemberNotFoundError";
  }
}

export class AccessDeniedError extends OrganizationDomainError {
  constructor(action: string) {
    super(`Access denied for action: ${action}`);
    this.name = "AccessDeniedError";
  }
}

export class OrganizationValidationError extends OrganizationDomainError {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationValidationError";
  }
}
