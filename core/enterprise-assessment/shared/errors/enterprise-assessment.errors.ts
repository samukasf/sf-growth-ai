export class EnterpriseAssessmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnterpriseAssessmentError";
  }
}

export class AssessmentNotFoundError extends EnterpriseAssessmentError {
  constructor(assessmentId: string) {
    super(`Assessment not found: ${assessmentId}`);
    this.name = "AssessmentNotFoundError";
  }
}

export class AssessmentIncompleteError extends EnterpriseAssessmentError {
  constructor(assessmentId: string) {
    super(`Assessment incomplete: ${assessmentId}`);
    this.name = "AssessmentIncompleteError";
  }
}
