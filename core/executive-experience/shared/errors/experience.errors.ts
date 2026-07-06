export class ExperienceDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExperienceDomainError";
  }
}

export class ExecutiveExperienceNotFoundError extends ExperienceDomainError {
  constructor(experienceId: string) {
    super(`Executive experience not found: ${experienceId}`);
    this.name = "ExecutiveExperienceNotFoundError";
  }
}

export class ExperienceValidationError extends ExperienceDomainError {
  constructor(message: string) {
    super(message);
    this.name = "ExperienceValidationError";
  }
}
