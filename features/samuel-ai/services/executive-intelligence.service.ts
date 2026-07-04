import type { ExecutiveContext } from "@/services/executive-context.service";
import type { CompanyMemoryRecord } from "@/services/executive-memory.service";

export type ExecutiveIntelligence = {
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  opportunities: string[];
  priorities: string[];
  executiveSummary: string;
};

function parseList(value: string | string[] | null | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function isStrategicMemory(memory: CompanyMemoryRecord) {
  const category = memory.category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const importance =
    typeof memory.importance === "number"
      ? memory.importance
      : Number.parseInt(String(memory.importance), 10);

  return (
    category.includes("estrateg") ||
    category.includes("decis") ||
    category.includes("result") ||
    (!Number.isNaN(importance) && importance >= 7)
  );
}

function hasExecutionStrategy(
  hasPositioning: boolean,
  differentiators: string[],
  hasValueProp: boolean,
) {
  return hasPositioning && (differentiators.length > 0 || hasValueProp);
}

function buildConfidenceScore(
  strategicMemories: number,
  hasPositioning: boolean,
  differentiators: string[],
  hasStrategy: boolean,
  hasWebsite: boolean,
) {
  const base = 42;
  const boost =
    strategicMemories * 8 +
    (hasPositioning ? 10 : 0) +
    (differentiators.length >= 2 ? 8 : 0) +
    (hasStrategy ? 10 : 0) +
    (hasWebsite ? 5 : 0);

  return Math.min(95, base + boost);
}

function buildExecutiveSummaryText(
  companyName: string,
  strengths: string[],
  weaknesses: string[],
  risks: string[],
  opportunities: string[],
  priorities: string[],
  confidence: number,
) {
  const lines: string[] = [
    `${companyName} apresenta ${strengths.length} força(s), ${weaknesses.length} fraqueza(s), ${risks.length} risco(s) e ${opportunities.length} oportunidade(s) identificadas pela engine de inteligência executiva.`,
    `Confiança analítica: ${confidence}%${confidence >= 70 ? " — base sólida para recomendações." : " — recomenda-se fortalecer o contexto estratégico antes de decisões críticas."}`,
  ];

  if (priorities.length > 0) {
    lines.push(`Prioridade imediata: ${priorities[0]}`);
  } else if (strengths.length > 0) {
    lines.push(`Leitura principal: ${strengths[0]}`);
  } else if (weaknesses.length > 0) {
    lines.push(`Atenção principal: ${weaknesses[0]}`);
  }

  return lines.join(" ");
}

export function buildExecutiveIntelligence(
  context: ExecutiveContext,
): ExecutiveIntelligence {
  const { company, businessProfile, memories } = context;
  const profile = businessProfile;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];
  const priorities: string[] = [];

  const differentiators = parseList(profile?.differentiators);
  const objectives = parseList(profile?.objectives);
  const segment = normalizeText(profile?.segment) || normalizeText(company.industry);
  const hasPositioning = Boolean(normalizeText(profile?.positioning));
  const hasWebsite = Boolean(normalizeText(company.website));
  const hasValueProp = Boolean(normalizeText(profile?.value_proposition));
  const hasMission = Boolean(normalizeText(profile?.mission));
  const hasVision = Boolean(normalizeText(profile?.vision));
  const hasDescription = Boolean(normalizeText(company.description));
  const businessStage = normalizeText(company.business_stage);
  const strategicMemories = memories.filter(isStrategicMemory);
  const hasStrategy = hasExecutionStrategy(
    hasPositioning,
    differentiators,
    hasValueProp,
  );

  if (!hasPositioning) {
    weaknesses.push(
      "Posicionamento de mercado não definido — mensagem institucional fragmentada.",
    );
    priorities.push("Definir posicionamento de mercado como prioridade estratégica.");
  } else {
    strengths.push(`Posicionamento claro: ${profile!.positioning}`);
  }

  if (differentiators.length === 0) {
    weaknesses.push("Ausência de diferenciais competitivos documentados.");
    priorities.push("Mapear e documentar diferenciais competitivos.");
  } else if (differentiators.length === 1) {
    risks.push(
      "Apenas um diferencial competitivo — vulnerabilidade a commoditização no segmento.",
    );
    opportunities.push(
      "Expandir diferenciais para reduzir dependência de um único argumento comercial.",
    );
    priorities.push("Fortalecer matriz de diferenciais competitivos.");
  } else {
    strengths.push(
      `${differentiators.length} diferenciais competitivos mapeados e prontos para uso estratégico.`,
    );
  }

  if (objectives.length > 0 && !hasStrategy) {
    weaknesses.push("Objetivos declarados sem estratégia clara de execução.");
    risks.push(
      "Objetivos sem estratégia aumentam risco de dispersão de esforços e baixo ROI.",
    );
    opportunities.push(
      "Traduzir objetivos em plano estratégico com marcos mensuráveis.",
    );
    priorities.push("Construir estratégia de execução para os objetivos declarados.");
  } else if (objectives.length > 0 && hasStrategy) {
    strengths.push(
      `${objectives.length} objetivo(s) alinhado(s) a uma estratégia de mercado definida.`,
    );
  }

  if (!hasWebsite) {
    risks.push("Ausência de website reduz credibilidade e descoberta digital.");
    opportunities.push(
      "Criar presença digital com website institucional para ampliar alcance e conversão.",
    );
    priorities.push("Estabelecer presença digital com website e canais de conversão.");
  } else {
    strengths.push("Presença digital ativa com website cadastrado.");
  }

  if (!hasDescription) {
    weaknesses.push("Descrição da empresa incompleta ou ausente.");
  } else {
    strengths.push("Identidade corporativa descrita e disponível para análise.");
  }

  if (!segment) {
    weaknesses.push("Segmento de atuação não identificado.");
  } else {
    strengths.push(`Atuação no segmento ${segment}.`);

    if (!hasPositioning) {
      risks.push(
        `Segmento ${segment} identificado sem posicionamento — risco de competição por preço.`,
      );
      opportunities.push(
        `Definir posicionamento no segmento ${segment} para diferenciação imediata.`,
      );
    }
  }

  if (hasMission && hasVision) {
    strengths.push("Missão e visão estratégicas documentadas.");
  } else {
    if (!hasMission) {
      weaknesses.push("Missão organizacional não documentada.");
    }
    if (!hasVision) {
      weaknesses.push("Visão de longo prazo não documentada.");
    }
  }

  if (hasValueProp) {
    strengths.push("Proposta de valor formalizada para comunicação de mercado.");
  } else if (hasPositioning) {
    opportunities.push(
      "Formalizar proposta de valor a partir do posicionamento já definido.",
    );
  }

  if (memories.length === 0) {
    weaknesses.push("Base de memória institucional ainda não estruturada.");
    opportunities.push(
      "Iniciar registro de memórias estratégicas para acelerar decisões futuras.",
    );
    priorities.push("Iniciar registro de memórias estratégicas para base de decisão.");
  } else if (strategicMemories.length === 0) {
    risks.push(
      "Memórias existentes com baixa relevância estratégica para decisões críticas.",
    );
    opportunities.push(
      "Elevar qualidade das memórias com decisões, resultados e aprendizados estratégicos.",
    );
  } else {
    strengths.push(
      `${strategicMemories.length} memória(s) estratégica(s) reforçam a confiança analítica.`,
    );
  }

  if (businessStage) {
    const earlyStages = ["idea", "ideia", "startup", "early", "inicial"];
    const normalizedStage = businessStage
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (earlyStages.some((stage) => normalizedStage.includes(stage))) {
      if (!hasStrategy) {
        risks.push(
          "Estágio inicial sem estratégia consolidada — risco de execução reativa.",
        );
      }
      opportunities.push(
        "Estágio inicial favorece definição rápida de posicionamento e narrativa de mercado.",
      );
    } else {
      strengths.push(`Estágio de negócio mapeado: ${businessStage}.`);
    }
  }

  const unique = (items: string[]) => [...new Set(items)];

  const finalStrengths = unique(strengths);
  const finalWeaknesses = unique(weaknesses);
  const finalRisks = unique(risks);
  const finalOpportunities = unique(opportunities);
  const finalPriorities = unique(priorities);

  const confidence = buildConfidenceScore(
    strategicMemories.length,
    hasPositioning,
    differentiators,
    hasStrategy,
    hasWebsite,
  );

  const executiveSummary = buildExecutiveSummaryText(
    company.name,
    finalStrengths,
    finalWeaknesses,
    finalRisks,
    finalOpportunities,
    finalPriorities,
    confidence,
  );

  return {
    strengths: finalStrengths,
    weaknesses: finalWeaknesses,
    risks: finalRisks,
    opportunities: finalOpportunities,
    priorities: finalPriorities,
    executiveSummary,
  };
}
