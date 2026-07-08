export class ClientLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientLifecycleError";
  }
}

export class ClientJourneyNotFoundError extends ClientLifecycleError {
  constructor(journeyId: string) {
    super(`Client journey not found: ${journeyId}`);
    this.name = "ClientJourneyNotFoundError";
  }
}

export class ClientLeadNotFoundError extends ClientLifecycleError {
  constructor(leadId: string) {
    super(`Client lead not found: ${leadId}`);
    this.name = "ClientLeadNotFoundError";
  }
}
