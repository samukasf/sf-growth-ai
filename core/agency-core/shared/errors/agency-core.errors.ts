export class AgencyCoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgencyCoreError";
  }
}

export class AgencyNotFoundError extends AgencyCoreError {
  constructor(agencyId: string) {
    super(`Agency not found: ${agencyId}`);
    this.name = "AgencyNotFoundError";
  }
}

export class AgencyClientNotFoundError extends AgencyCoreError {
  constructor(clientId: string) {
    super(`Agency client not found: ${clientId}`);
    this.name = "AgencyClientNotFoundError";
  }
}
