export class EnterpriseMemoryDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnterpriseMemoryDomainError";
  }
}

export class MemoryNotFoundError extends EnterpriseMemoryDomainError {
  constructor(memoryId: string) {
    super(`Memory not found: ${memoryId}`);
    this.name = "MemoryNotFoundError";
  }
}

export class MemoryValidationError extends EnterpriseMemoryDomainError {
  constructor(message: string) {
    super(message);
    this.name = "MemoryValidationError";
  }
}

export class MemoryRetentionError extends EnterpriseMemoryDomainError {
  constructor(message: string) {
    super(message);
    this.name = "MemoryRetentionError";
  }
}
