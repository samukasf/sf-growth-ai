export class ExecutiveCouncilDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutiveCouncilDomainError";
  }
}

export class CouncilSessionNotFoundError extends ExecutiveCouncilDomainError {
  constructor(sessionId: string) {
    super(`Council session not found: ${sessionId}`);
    this.name = "CouncilSessionNotFoundError";
  }
}

export class CouncilMemberNotFoundError extends ExecutiveCouncilDomainError {
  constructor(memberId: string) {
    super(`Council member not found: ${memberId}`);
    this.name = "CouncilMemberNotFoundError";
  }
}

export class CouncilConsensusError extends ExecutiveCouncilDomainError {
  constructor(message: string) {
    super(message);
    this.name = "CouncilConsensusError";
  }
}
