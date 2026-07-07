export class EnterpriseBrainDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnterpriseBrainDomainError";
  }
}

export class BrainSnapshotNotFoundError extends EnterpriseBrainDomainError {
  constructor(snapshotId: string) {
    super(`Brain snapshot not found: ${snapshotId}`);
    this.name = "BrainSnapshotNotFoundError";
  }
}

export class BrainContextBuildError extends EnterpriseBrainDomainError {
  constructor(message: string) {
    super(message);
    this.name = "BrainContextBuildError";
  }
}

export class BrainStateError extends EnterpriseBrainDomainError {
  constructor(message: string) {
    super(message);
    this.name = "BrainStateError";
  }
}
