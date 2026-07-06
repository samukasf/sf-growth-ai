export class OrchestratorDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrchestratorDomainError";
  }
}

export class ExecutiveRequestNotFoundError extends OrchestratorDomainError {
  constructor(requestId: string) {
    super(`Executive request not found: ${requestId}`);
    this.name = "ExecutiveRequestNotFoundError";
  }
}

export class ExecutiveSessionNotFoundError extends OrchestratorDomainError {
  constructor(sessionId: string) {
    super(`Executive session not found: ${sessionId}`);
    this.name = "ExecutiveSessionNotFoundError";
  }
}

export class OrchestratorValidationError extends OrchestratorDomainError {
  constructor(message: string) {
    super(message);
    this.name = "OrchestratorValidationError";
  }
}
