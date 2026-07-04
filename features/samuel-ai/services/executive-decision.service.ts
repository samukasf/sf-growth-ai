import type { ExecutiveIntelligence } from "./executive-intelligence.service";

export type DecisionPriority = "Critical" | "High" | "Medium" | "Low";

export type DecisionImpact =
  | "Receita"
  | "Marca"
  | "Operação"
  | "Marketing"
  | "Financeiro"
  | "Vendas";

export type DecisionDifficulty = "Alta" | "Média" | "Baixa";

export type DecisionStatus =
  | "pending"
  | "approved"
  | "in_progress"
  | "completed";

export type DecisionSource =
  | "weakness"
  | "risk"
  | "opportunity"
  | "priority"
  | "strength";

export type ExecutiveDecision = {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: DecisionPriority;
  impact: DecisionImpact;
  difficulty: DecisionDifficulty;
  department: string;
  estimatedROI: string;
  deadline: string;
  status: DecisionStatus;
  source: DecisionSource;
};

type DecisionTemplate = Omit<ExecutiveDecision, "id" | "reason" | "source"> & {
  patterns: string[];
  source: DecisionSource;
};

const PRIORITY_ORDER: Record<DecisionPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const DECISION_RULES: DecisionTemplate[] = [
  {
    patterns: ["posicionamento", "não definido", "nao definido", "fragmentada"],
    source: "weakness",
    title: "Definir posicionamento oficial da marca",
    description:
      "Conduzir workshop executivo para formalizar posicionamento, promessa e território de marca.",
    priority: "Critical",
    impact: "Marca",
    difficulty: "Média",
    department: "Estratégia",
    estimatedROI: "18–30% em clareza comercial em 60 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["diferenciais competitivos", "ausência de diferenciais", "ausencia de diferenciais"],
    source: "weakness",
    title: "Criar proposta única de valor",
    description:
      "Mapear diferenciais reais do negócio e consolidar uma proposta única de valor para mercado.",
    priority: "Critical",
    impact: "Vendas",
    difficulty: "Média",
    department: "Marketing",
    estimatedROI: "12–22% em taxa de conversão em 90 dias",
    deadline: "30 dias",
    status: "pending",
  },
  {
    patterns: ["poucos diferenciais", "apenas um diferencial", "commoditização"],
    source: "risk",
    title: "Fortalecer matriz de diferenciais competitivos",
    description:
      "Expandir argumentos de venda e barreiras competitivas além do diferencial atual.",
    priority: "High",
    impact: "Vendas",
    difficulty: "Média",
    department: "Estratégia",
    estimatedROI: "10–18% em ticket médio em 60 dias",
    deadline: "45 dias",
    status: "pending",
  },
  {
    patterns: ["website", "presença digital", "presenca digital"],
    source: "opportunity",
    title: "Construir website institucional",
    description:
      "Lançar website com narrativa de marca, prova social e canais de conversão integrados.",
    priority: "High",
    impact: "Marketing",
    difficulty: "Média",
    department: "Marketing",
    estimatedROI: "20–35% em descoberta digital em 90 dias",
    deadline: "30 dias",
    status: "pending",
  },
  {
    patterns: ["ausência de website", "ausencia de website", "website reduz"],
    source: "risk",
    title: "Estabelecer presença digital institucional",
    description:
      "Mitigar risco de invisibilidade digital com website, SEO básico e página de conversão.",
    priority: "High",
    impact: "Receita",
    difficulty: "Média",
    department: "Marketing",
    estimatedROI: "15–28% em leads qualificados em 60 dias",
    deadline: "30 dias",
    status: "pending",
  },
  {
    patterns: ["objetivos declarados sem estratégia", "objetivos sem estratégia", "objetivos sem estrategia"],
    source: "weakness",
    title: "Construir plano estratégico de execução",
    description:
      "Traduzir objetivos em roadmap com marcos, responsáveis, orçamento e indicadores de sucesso.",
    priority: "Critical",
    impact: "Operação",
    difficulty: "Alta",
    department: "Estratégia",
    estimatedROI: "25–40% em eficiência de execução em 90 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["dispersão de esforços", "dispersao de esforcos"],
    source: "risk",
    title: "Priorizar portfólio de iniciativas",
    description:
      "Selecionar até três iniciativas com maior ROI e pausar projetos sem impacto mensurável.",
    priority: "High",
    impact: "Financeiro",
    difficulty: "Média",
    department: "Estratégia",
    estimatedROI: "18–26% em retorno sobre investimento em 60 dias",
    deadline: "14 dias",
    status: "pending",
  },
  {
    patterns: ["memória institucional", "memoria institucional", "memórias estratégicas", "memorias estrategicas"],
    source: "weakness",
    title: "Estruturar base de memória executiva",
    description:
      "Implementar ritual de registro de decisões, resultados e aprendizados estratégicos.",
    priority: "Medium",
    impact: "Operação",
    difficulty: "Baixa",
    department: "Estratégia",
    estimatedROI: "30–45% em velocidade de decisão em 90 dias",
    deadline: "14 dias",
    status: "pending",
  },
  {
    patterns: ["baixa relevância estratégica", "baixa relevancia estrategica"],
    source: "risk",
    title: "Elevar qualidade das memórias estratégicas",
    description:
      "Reclassificar memórias por impacto e registrar apenas decisões com consequência mensurável.",
    priority: "Medium",
    impact: "Operação",
    difficulty: "Baixa",
    department: "Estratégia",
    estimatedROI: "20–30% em precisão analítica em 45 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["proposta de valor", "formalizar proposta"],
    source: "opportunity",
    title: "Formalizar proposta de valor",
    description:
      "Converter posicionamento existente em proposta de valor clara para site, vendas e marketing.",
    priority: "High",
    impact: "Marca",
    difficulty: "Média",
    department: "Marketing",
    estimatedROI: "14–24% em conversão comercial em 60 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["segmento", "não identificado", "nao identificado"],
    source: "weakness",
    title: "Definir segmento e ICP oficial",
    description:
      "Documentar segmento prioritário, perfil de cliente ideal e critérios de priorização comercial.",
    priority: "High",
    impact: "Vendas",
    difficulty: "Média",
    department: "Comercial",
    estimatedROI: "16–28% em eficiência de prospecção em 45 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["missão", "visão", "missao", "visao"],
    source: "weakness",
    title: "Documentar missão e visão organizacional",
    description:
      "Formalizar direção de longo prazo para alinhar marketing, vendas e operação.",
    priority: "Medium",
    impact: "Marca",
    difficulty: "Baixa",
    department: "Estratégia",
    estimatedROI: "10–15% em alinhamento interno em 30 dias",
    deadline: "30 dias",
    status: "pending",
  },
  {
    patterns: ["descrição da empresa", "descricao da empresa"],
    source: "weakness",
    title: "Atualizar identidade corporativa",
    description:
      "Reescrever descrição institucional com foco em valor entregue, segmento e diferenciais.",
    priority: "Medium",
    impact: "Marca",
    difficulty: "Baixa",
    department: "Marketing",
    estimatedROI: "8–14% em percepção de autoridade em 30 dias",
    deadline: "14 dias",
    status: "pending",
  },
  {
    patterns: ["estágio inicial", "estagio inicial", "execução reativa", "execucao reativa"],
    source: "risk",
    title: "Consolidar estratégia de arranque",
    description:
      "Definir foco estratégico único para evitar dispersão em estágio inicial de crescimento.",
    priority: "Critical",
    impact: "Operação",
    difficulty: "Alta",
    department: "Estratégia",
    estimatedROI: "22–35% em foco executivo em 60 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["competição por preço", "competicao por preco"],
    source: "risk",
    title: "Reposicionar oferta para valor percebido",
    description:
      "Sair da disputa por preço com narrativa de valor, provas e pacotes diferenciados.",
    priority: "High",
    impact: "Receita",
    difficulty: "Alta",
    department: "Comercial",
    estimatedROI: "12–20% em margem em 90 dias",
    deadline: "45 dias",
    status: "pending",
  },
  {
    patterns: ["posicionamento claro", "posicionamento definido"],
    source: "strength",
    title: "Ativar posicionamento em todos os canais",
    description:
      "Padronizar mensagem de posicionamento em site, vendas, redes sociais e materiais comerciais.",
    priority: "Medium",
    impact: "Marca",
    difficulty: "Baixa",
    department: "Marketing",
    estimatedROI: "10–18% em consistência de marca em 30 dias",
    deadline: "14 dias",
    status: "pending",
  },
  {
    patterns: ["diferenciais competitivos mapeados"],
    source: "strength",
    title: "Incorporar diferenciais no playbook comercial",
    description:
      "Treinar equipe comercial para usar diferenciais como argumentos centrais de fechamento.",
    priority: "Medium",
    impact: "Vendas",
    difficulty: "Baixa",
    department: "Comercial",
    estimatedROI: "15–22% em taxa de fechamento em 45 dias",
    deadline: "21 dias",
    status: "pending",
  },
  {
    patterns: ["memória(s) estratégica(s)", "memoria(s) estrategica(s)"],
    source: "strength",
    title: "Institucionalizar aprendizados estratégicos",
    description:
      "Transformar memórias estratégicas em diretrizes operacionais para novas decisões.",
    priority: "Low",
    impact: "Operação",
    difficulty: "Baixa",
    department: "Estratégia",
    estimatedROI: "18–25% em qualidade decisória em 60 dias",
    deadline: "30 dias",
    status: "pending",
  },
  {
    patterns: ["objetivo(s) alinhado(s)", "objetivo(s) alinhados"],
    source: "strength",
    title: "Executar roadmap dos objetivos estratégicos",
    description:
      "Ativar cronograma de execução com checkpoints quinzenais e métricas de avanço.",
    priority: "High",
    impact: "Operação",
    difficulty: "Média",
    department: "Estratégia",
    estimatedROI: "20–32% em cumprimento de metas em 90 dias",
    deadline: "7 dias",
    status: "pending",
  },
  {
    patterns: ["website cadastrado", "presença digital ativa", "presenca digital ativa"],
    source: "strength",
    title: "Otimizar website para conversão",
    description:
      "Auditar jornada do visitante, CTAs e prova social para elevar taxa de conversão.",
    priority: "Medium",
    impact: "Marketing",
    difficulty: "Média",
    department: "Marketing",
    estimatedROI: "12–20% em conversão digital em 45 dias",
    deadline: "21 dias",
    status: "pending",
  },
];

function normalizeInsight(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesRule(insight: string, patterns: string[]) {
  const normalized = normalizeInsight(insight);
  return patterns.some((pattern) => normalized.includes(normalizeInsight(pattern)));
}

function createDecision(
  template: DecisionTemplate,
  reason: string,
  index: number,
): ExecutiveDecision {
  return {
    id: `decision-${index}`,
    title: template.title,
    description: template.description,
    reason,
    priority: template.priority,
    impact: template.impact,
    difficulty: template.difficulty,
    department: template.department,
    estimatedROI: template.estimatedROI,
    deadline: template.deadline,
    status: template.status,
    source: template.source,
  };
}

function buildFallbackDecision(
  insight: string,
  source: DecisionSource,
  index: number,
): ExecutiveDecision {
  const defaults: Record<
    DecisionSource,
    Omit<ExecutiveDecision, "id" | "reason" | "source" | "title" | "description">
  > = {
    weakness: {
      priority: "High",
      impact: "Operação",
      difficulty: "Média",
      department: "Estratégia",
      estimatedROI: "10–18% em eficiência operacional em 60 dias",
      deadline: "30 dias",
      status: "pending",
    },
    risk: {
      priority: "High",
      impact: "Financeiro",
      difficulty: "Média",
      department: "Estratégia",
      estimatedROI: "12–20% em mitigação de risco em 60 dias",
      deadline: "21 dias",
      status: "pending",
    },
    opportunity: {
      priority: "Medium",
      impact: "Receita",
      difficulty: "Média",
      department: "Comercial",
      estimatedROI: "15–25% em novas oportunidades em 90 dias",
      deadline: "45 dias",
      status: "pending",
    },
    priority: {
      priority: "Critical",
      impact: "Operação",
      difficulty: "Média",
      department: "Estratégia",
      estimatedROI: "18–30% em foco estratégico em 60 dias",
      deadline: "14 dias",
      status: "pending",
    },
    strength: {
      priority: "Low",
      impact: "Marca",
      difficulty: "Baixa",
      department: "Estratégia",
      estimatedROI: "8–15% em capitalização de ativos em 45 dias",
      deadline: "30 dias",
      status: "pending",
    },
  };

  const config = defaults[source];
  const actionVerb =
    source === "weakness"
      ? "Corrigir"
      : source === "risk"
        ? "Mitigar"
        : source === "opportunity"
          ? "Capturar"
          : source === "priority"
            ? "Executar"
            : "Capitalizar";

  return {
    id: `decision-fallback-${index}`,
    title: `${actionVerb}: ${insight.split(/[.—]/)[0]?.trim() ?? "iniciativa estratégica"}`,
    description: `Decisão executiva derivada da análise de ${source} para endereçar: ${insight}`,
    reason: insight,
    source,
    ...config,
  };
}

function insightsFromIntelligence(intelligence: ExecutiveIntelligence) {
  return [
    ...intelligence.weaknesses.map((insight) => ({
      insight,
      source: "weakness" as const,
    })),
    ...intelligence.risks.map((insight) => ({
      insight,
      source: "risk" as const,
    })),
    ...intelligence.opportunities.map((insight) => ({
      insight,
      source: "opportunity" as const,
    })),
    ...intelligence.priorities.map((insight) => ({
      insight,
      source: "priority" as const,
    })),
    ...intelligence.strengths.map((insight) => ({
      insight,
      source: "strength" as const,
    })),
  ];
}

export function buildExecutiveDecisions(
  intelligence: ExecutiveIntelligence,
): ExecutiveDecision[] {
  const decisions: ExecutiveDecision[] = [];
  const usedTitles = new Set<string>();
  let counter = 0;

  for (const { insight, source } of insightsFromIntelligence(intelligence)) {
    const matchedRule = DECISION_RULES.find(
      (rule) => rule.source === source && matchesRule(insight, rule.patterns),
    );

    const decision = matchedRule
      ? createDecision(matchedRule, insight, counter++)
      : buildFallbackDecision(insight, source, counter++);

    if (usedTitles.has(decision.title)) {
      continue;
    }

    usedTitles.add(decision.title);
    decisions.push(decision);
  }

  return decisions.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
}
