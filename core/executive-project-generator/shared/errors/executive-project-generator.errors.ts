export class ExecutiveProjectGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutiveProjectGeneratorError";
  }
}

export class ProjectNotFoundError extends ExecutiveProjectGeneratorError {
  constructor(projectId: string) {
    super(`Project not found: ${projectId}`);
    this.name = "ProjectNotFoundError";
  }
}

