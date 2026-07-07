import type {
  DiscoveryReporter,
  GenerateReportInput,
  DiscoveryReport,
} from "../../domain";

export class DefaultDiscoveryReporter implements DiscoveryReporter {
  generate(input: GenerateReportInput): DiscoveryReport {
    const topOpportunities = input.opportunities
      .sort((a, b) => {
        const priority = { strategic: 4, high: 3, medium: 2, low: 1 };
        return priority[b.priority] - priority[a.priority];
      })
      .slice(0, 3);

    const criticalGaps = input.gaps.filter((g) => g.severity === "critical" || g.severity === "high");

    const summary = [
      `Descoberta empresarial concluída para ${input.session.companyName}.`,
      `Perfil: ${input.profile.completenessScore}% completo.`,
      `Score geral: ${input.score.overallScore}/100.`,
      `${input.opportunities.length} oportunidades e ${input.gaps.length} lacunas detectadas.`,
    ].join(" ");

    const nextSteps = [
      ...criticalGaps.slice(0, 2).map((g) => g.recommendation),
      ...topOpportunities.map((o) => `Avaliar: ${o.title}`),
      "Sincronizar perfil com Enterprise Brain e Executive Knowledge.",
    ];

    return {
      session: input.session.toJSON(),
      profile: input.profile.toJSON(),
      score: input.score.toJSON(),
      gaps: input.gaps.map((g) => g.toJSON()),
      opportunities: input.opportunities.map((o) => o.toJSON()),
      summary,
      nextSteps,
      generatedAt: new Date().toISOString(),
    };
  }
}
