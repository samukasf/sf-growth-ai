export class MultiTenantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MultiTenantError";
  }
}

export class TenantNotFoundError extends MultiTenantError {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`);
    this.name = "TenantNotFoundError";
  }
}

export class TenantIsolationError extends MultiTenantError {
  constructor(tenantId: string) {
    super(`Tenant isolation violation: ${tenantId}`);
    this.name = "TenantIsolationError";
  }
}
