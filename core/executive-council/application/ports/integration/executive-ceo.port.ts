export interface ExecutiveCEOPort {
  finalizeCouncilResponse(input: {
    query: string;
    consensus: string;
    recommendation: string;
    confidence: number;
  }): Promise<string>;
}
