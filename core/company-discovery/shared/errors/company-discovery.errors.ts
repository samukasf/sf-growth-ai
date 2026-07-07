export class CompanyDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompanyDiscoveryError";
  }
}

export class DiscoverySessionNotFoundError extends CompanyDiscoveryError {
  constructor(sessionId: string) {
    super(`Discovery session not found: ${sessionId}`);
    this.name = "DiscoverySessionNotFoundError";
  }
}

export class CompanyProfileNotFoundError extends CompanyDiscoveryError {
  constructor(companyId: string) {
    super(`Company profile not found: ${companyId}`);
    this.name = "CompanyProfileNotFoundError";
  }
}
