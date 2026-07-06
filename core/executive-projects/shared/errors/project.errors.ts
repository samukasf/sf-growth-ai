export class ProjectDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectDomainError";
  }
}

export class ExecutiveProjectNotFoundError extends ProjectDomainError {
  constructor(projectId: string) {
    super(`Executive project not found: ${projectId}`);
    this.name = "ExecutiveProjectNotFoundError";
  }
}

export class ProjectValidationError extends ProjectDomainError {
  constructor(message: string) {
    super(message);
    this.name = "ProjectValidationError";
  }
}
