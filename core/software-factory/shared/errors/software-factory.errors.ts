export class SoftwareFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SoftwareFactoryError";
  }
}

export class SoftwareProjectNotFoundError extends SoftwareFactoryError {
  constructor(projectId: string) {
    super(`Software project not found: ${projectId}`);
    this.name = "SoftwareProjectNotFoundError";
  }
}

