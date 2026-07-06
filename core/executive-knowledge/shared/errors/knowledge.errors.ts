export class KnowledgeDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeDomainError";
  }
}

export class KnowledgeRecordNotFoundError extends KnowledgeDomainError {
  constructor(recordId: string) {
    super(`Knowledge record not found: ${recordId}`);
    this.name = "KnowledgeRecordNotFoundError";
  }
}

export class KnowledgeValidationError extends KnowledgeDomainError {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeValidationError";
  }
}

export class KnowledgeRelationError extends KnowledgeDomainError {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeRelationError";
  }
}
