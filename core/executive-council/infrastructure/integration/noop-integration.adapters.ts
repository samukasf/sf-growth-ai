import type {
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
} from "../../application/ports/integration";

export class NoopExecutiveOrchestratorAdapter implements ExecutiveOrchestratorPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  async finalizeCouncilResponse(input: {
    query: string;
    consensus: string;
    recommendation: string;
    confidence: number;
  }): Promise<string> {
    return `[Executive CEO] Based on council deliberation (confidence: ${input.confidence}%): ${input.recommendation}`;
  }
}
