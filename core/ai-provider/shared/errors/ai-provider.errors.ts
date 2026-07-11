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

/** Falha ao chamar a API real de um provider (rede, HTTP não-2xx, resposta inesperada). */
export class AIProviderRequestError extends AIProviderDomainError {
  readonly providerId: string;
  readonly statusCode: number;

  constructor(providerId: string, statusCode: number, details: string) {
    super(
      `AI provider request failed: ${providerId} (status ${statusCode})${details ? ` — ${details}` : ""}`,
    );
    this.name = "AIProviderRequestError";
    this.providerId = providerId;
    this.statusCode = statusCode;
  }
}
