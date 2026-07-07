import { DiscoveryGap, type AnalyzeGapsInput, type GapAnalyzer } from "../../domain";

const REQUIRED_SECTIONS = ["identity", "products", "customers", "operations", "finance"];

export class DefaultGapAnalyzer implements GapAnalyzer {
  analyze(input: AnalyzeGapsInput): DiscoveryGap[] {
    const gaps: DiscoveryGap[] = [];
    const coveredKeys = new Set(input.profile.sections.map((s) => s.key));

    for (const section of REQUIRED_SECTIONS) {
      if (!coveredKeys.has(section)) {
        gaps.push(
          DiscoveryGap.create({
            sessionId: input.sessionId,
            area: section,
            title: `Dados insuficientes: ${section}`,
            description: `A área "${section}" não possui dados suficientes no perfil empresarial.`,
            severity: section === "finance" || section === "operations" ? "high" : "medium",
            impact: "Decisões do Supercérebro nesta área terão baixa confiança.",
            recommendation: `Coletar dados adicionais via questionários, entrevistas ou integração de sistemas.`,
          }),
        );
      }
    }

    const lowConfidenceSections = input.profile.sections.filter((s) => s.confidence < 50);
    for (const section of lowConfidenceSections) {
      gaps.push(
        DiscoveryGap.create({
          sessionId: input.sessionId,
          area: section.key,
          title: `Baixa confiança: ${section.label}`,
          description: `Dados da área "${section.label}" têm confiança de apenas ${section.confidence}%.`,
          severity: "medium",
          impact: "Recomendações podem ser imprecisas.",
          recommendation: "Validar dados com responsável da área ou fonte primária.",
        }),
      );
    }

    if (input.findings.length < 10) {
      gaps.push(
        DiscoveryGap.create({
          sessionId: input.sessionId,
          area: "discovery",
          title: "Cobertura de descoberta limitada",
          description: `Apenas ${input.findings.length} achados coletados — mínimo recomendado: 10.`,
          severity: "high",
          impact: "Perfil empresarial incompleto para operação do Supercérebro.",
          recommendation: "Ativar mais fontes de descoberta ou completar questionário.",
        }),
      );
    }

    return gaps;
  }
}
