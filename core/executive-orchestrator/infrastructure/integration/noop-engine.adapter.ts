import type { ExecutiveEngineContribution } from "../../domain";
import type { ExecutiveParticipantId } from "../../shared";
import type { ExecutiveEnginePort } from "../../application/ports/integration";

function createContribution(
  participantId: ExecutiveParticipantId,
  _query: string,
): ExecutiveEngineContribution {
  const templates: Record<
    ExecutiveParticipantId,
    Pick<ExecutiveEngineContribution, "opinion" | "recommendation" | "risks" | "opportunities">
  > = {
    executive_context: {
      opinion: "Contexto operacional identificado para a solicitação.",
      recommendation: "Validar premissas com dados internos antes de decidir.",
      risks: ["Contexto incompleto"],
      opportunities: ["Melhor alinhamento estratégico"],
    },
    marketing: {
      opinion: "Há espaço para otimizar aquisição e posicionamento.",
      recommendation: "Revisar canais de marketing e campanhas ativas.",
      risks: ["CAC elevado"],
      opportunities: ["Novas campanhas segmentadas"],
    },
    sales: {
      opinion: "Pipeline e conversão podem ser otimizados.",
      recommendation: "Revisar funil de vendas e follow-up comercial.",
      risks: ["Queda de conversão"],
      opportunities: ["Upsell e cross-sell"],
    },
    finance: {
      opinion: "Viabilidade financeira depende de investimento e retorno.",
      recommendation: "Projetar ROI e fluxo de caixa para 12 meses.",
      risks: ["Pressão de caixa"],
      opportunities: ["Melhor margem operacional"],
    },
    forecast: {
      opinion: "Cenários projetam crescimento moderado com investimento.",
      recommendation: "Simular cenários otimista, base e conservador.",
      risks: ["Projeção otimista demais"],
      opportunities: ["Crescimento acelerado"],
    },
    innovation: {
      opinion: "Oportunidades de inovação identificadas no processo.",
      recommendation: "Mapear automações e novos produtos/serviços.",
      risks: ["Resistência à mudança"],
      opportunities: ["Automação de processos manuais"],
    },
    operations: {
      opinion: "Processos operacionais podem ser otimizados.",
      recommendation: "Mapear gargalos e reduzir desperdícios.",
      risks: ["Ineficiência operacional"],
      opportunities: ["Ganho de produtividade"],
    },
    experience: {
      opinion: "Experiências anteriores indicam padrões reutilizáveis.",
      recommendation: "Consultar casos de sucesso e falha similares.",
      risks: ["Repetir erros passados"],
      opportunities: ["Replicar soluções validadas"],
    },
    wisdom: {
      opinion: "Melhores práticas sugerem abordagem estruturada.",
      recommendation: "Aplicar playbooks e lições aprendidas.",
      risks: ["Ignorar aprendizados anteriores"],
      opportunities: ["Decisão mais informada"],
    },
    legal: {
      opinion: "Requisitos legais devem ser verificados antes da expansão.",
      recommendation: "Consultar compliance e contratos necessários.",
      risks: ["Não conformidade regulatória"],
      opportunities: ["Estrutura legal sólida"],
    },
    hr: {
      opinion: "Impacto em equipe e contratações deve ser avaliado.",
      recommendation: "Planejar capacitação e dimensionamento de equipe.",
      risks: ["Falta de mão de obra"],
      opportunities: ["Equipe mais capacitada"],
    },
    project_generator: {
      opinion: "Projeto estruturado pode ser gerado a partir da oportunidade.",
      recommendation: "Criar projeto com escopo, milestones e orçamento.",
      risks: ["Escopo mal definido"],
      opportunities: ["Execução organizada"],
    },
    crm: {
      opinion: "Relacionamento com clientes pode ser fortalecido.",
      recommendation: "Implementar ou otimizar CRM e follow-up.",
      risks: ["Perda de clientes"],
      opportunities: ["Retenção e fidelização"],
    },
    google_business: {
      opinion: "Presença digital local pode ser melhorada.",
      recommendation: "Otimizar Google Business Profile e avaliações.",
      risks: ["Baixa visibilidade local"],
      opportunities: ["Mais clientes locais"],
    },
    knowledge: {
      opinion: "Conhecimento relevante disponível na base interna.",
      recommendation: "Recuperar documentos e insights relacionados.",
      risks: ["Informação desatualizada"],
      opportunities: ["Decisão baseada em dados"],
    },
    learning: {
      opinion: "Aprendizados anteriores aplicáveis ao cenário.",
      recommendation: "Aplicar padrões detectados em situações similares.",
      risks: ["Não aplicar feedback"],
      opportunities: ["Melhoria contínua"],
    },
    memory: {
      opinion: "Memória factual da empresa disponível para consulta.",
      recommendation: "Validar fatos com Business Twin antes de decidir.",
      risks: ["Dados desatualizados"],
      opportunities: ["Decisão fundamentada"],
    },
    company_brain: {
      opinion: "Inteligência corporativa enriquece a análise.",
      recommendation: "Integrar visão holística do Company Brain.",
      risks: ["Visão fragmentada"],
      opportunities: ["Sinergia entre áreas"],
    },
    ceo: {
      opinion: "Consolidação executiva necessária.",
      recommendation: "Tomar decisão final com base no consenso.",
      risks: ["Paralisia por análise"],
      opportunities: ["Direção clara"],
    },
  };

  const template = templates[participantId];

  return {
    participantId,
    opinion: `${template.opinion} (contexto: "${_query.slice(0, 80)}")`,
    confidence: 65 + Math.floor(Math.random() * 20),
    priority: 60 + Math.floor(Math.random() * 25),
    recommendation: template.recommendation,
    risks: template.risks,
    opportunities: template.opportunities,
  };
}

export function createNoopEnginePort(participantId: ExecutiveParticipantId): ExecutiveEnginePort {
  return {
    participantId,
    async contribute(query: string) {
      return createContribution(participantId, query);
    },
  };
}
