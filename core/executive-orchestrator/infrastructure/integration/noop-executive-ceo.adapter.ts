import type { ExecutiveCEOPort } from "../../application/ports/integration";

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  async finalizeResponse(input: {
    query: string;
    consensus: string;
    recommendation: string;
    confidence: number;
  }): Promise<string> {
    return [
      `**Decisão Executiva — Samuel AI**`,
      ``,
      `**Sua solicitação:** ${input.query}`,
      ``,
      `**Consenso do Conselho:** ${input.consensus}`,
      ``,
      `**Recomendação consolidada:** ${input.recommendation}`,
      ``,
      `**Confiança:** ${input.confidence}%`,
    ].join("\n");
  }
}
