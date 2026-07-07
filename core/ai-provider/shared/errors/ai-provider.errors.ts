export class AIProviderDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderDomainError";
  }
}

export class AIProviderNotFoundError extends AIProviderDomainError {
  constructor(providerId: string) {
    super(`AI provider not found: ${providerId}`);
    this.name = "AIProviderNotFoundError";
  }
}

export class AIProviderUnavailableError extends AIProviderDomainError {
  constructor(providerId: string) {
    super(`AI provider unavailable: ${providerId}`);
    this.name = "AIProviderUnavailableError";
  }
}

export class AIUsageLimitExceededError extends AIProviderDomainError {
  constructor(message: string) {
    super(message);
    this.name = "AIUsageLimitExceededError";
  }
}

export class AIProviderValidationError extends AIProviderDomainError {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderValidationError";
  }
}
