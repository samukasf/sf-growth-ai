export class WisdomDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WisdomDomainError";
  }
}

export class ExecutiveWisdomNotFoundError extends WisdomDomainError {
  constructor(wisdomId: string) {
    super(`Executive wisdom not found: ${wisdomId}`);
    this.name = "ExecutiveWisdomNotFoundError";
  }
}

export class WisdomValidationError extends WisdomDomainError {
  constructor(message: string) {
    super(message);
    this.name = "WisdomValidationError";
  }
}
