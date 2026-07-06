export class LearningDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearningDomainError";
  }
}

export class LearningRecordNotFoundError extends LearningDomainError {
  constructor(recordId: string) {
    super(`Learning record not found: ${recordId}`);
    this.name = "LearningRecordNotFoundError";
  }
}

export class LearningValidationError extends LearningDomainError {
  constructor(message: string) {
    super(message);
    this.name = "LearningValidationError";
  }
}
