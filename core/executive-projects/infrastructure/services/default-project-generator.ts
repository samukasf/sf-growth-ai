import {
  ExecutiveProject,
  type ProjectGenerationInput,
  type ProjectGenerator,
  type ProjectType,
} from "../../domain";

type ProjectTemplate = {
  title: string;
  description: string;
  proposedSolution: string;
  complexity: number;
  duration: number;
  cost: number;
  deliverables: string[];
  dependencies: string[];
};

const PROJECT_TEMPLATES: Record<ProjectType, ProjectTemplate> = {
  website: {
    title: "Website Institucional",
    description: "Desenvolvimento de website institucional responsivo com SEO e analytics.",
    proposedSolution: "Site moderno com CMS, páginas institucionais e formulários de contato.",
    complexity: 40,
    duration: 30,
    cost: 12000,
    deliverables: ["Design", "Frontend", "CMS", "Deploy"],
    dependencies: ["Domínio", "Conteúdo aprovado"],
  },
  mobile_app: {
    title: "Aplicativo Mobile",
    description: "Aplicativo mobile nativo/híbrido para clientes ou equipe interna.",
    proposedSolution: "App iOS/Android com autenticação, notificações e sincronização.",
    complexity: 75,
    duration: 90,
    cost: 45000,
    deliverables: ["Protótipo", "App iOS", "App Android", "Publicação nas lojas"],
    dependencies: ["Contas de desenvolvedor", "Backend API"],
  },
  web_system: {
    title: "Sistema Web",
    description: "Sistema web interno para gestão de processos e operações.",
    proposedSolution: "Plataforma web com autenticação, módulos operacionais e relatórios.",
    complexity: 70,
    duration: 75,
    cost: 38000,
    deliverables: ["Arquitetura", "Backend", "Frontend", "Testes"],
    dependencies: ["Requisitos validados", "Infraestrutura cloud"],
  },
  crm: {
    title: "CRM Interno",
    description: "Sistema de gestão de relacionamento com clientes e pipeline de vendas.",
    proposedSolution: "CRM com cadastro de leads, funil de vendas e histórico de interações.",
    complexity: 65,
    duration: 60,
    cost: 32000,
    deliverables: ["Módulo de leads", "Pipeline", "Relatórios", "Integrações"],
    dependencies: ["Base de clientes", "Processo comercial definido"],
  },
  scheduling: {
    title: "Sistema de Agendamento",
    description: "Plataforma de agendamento online com confirmações e lembretes.",
    proposedSolution: "Sistema de agenda com calendário, notificações e gestão de horários.",
    complexity: 55,
    duration: 45,
    cost: 22000,
    deliverables: ["Calendário", "Notificações", "Painel admin", "Integração WhatsApp"],
    dependencies: ["Regras de horário", "Equipe de atendimento"],
  },
  delivery: {
    title: "Plataforma de Delivery",
    description: "Sistema de pedidos e entregas com rastreamento.",
    proposedSolution: "Plataforma de delivery com cardápio, pedidos, pagamento e tracking.",
    complexity: 80,
    duration: 90,
    cost: 50000,
    deliverables: ["App cliente", "Painel loja", "Rastreamento", "Pagamentos"],
    dependencies: ["Cardápio", "Logística de entrega"],
  },
  loyalty: {
    title: "Programa de Fidelização",
    description: "Sistema de pontos, recompensas e retenção de clientes.",
    proposedSolution: "Programa de fidelidade com pontos, níveis e campanhas.",
    complexity: 50,
    duration: 40,
    cost: 18000,
    deliverables: ["Motor de pontos", "Catálogo de recompensas", "Dashboard"],
    dependencies: ["Regras de pontuação", "Catálogo de prêmios"],
  },
  automation: {
    title: "Automação de Processos",
    description: "Automação de processos manuais repetitivos da operação.",
    proposedSolution: "Workflows automatizados com integrações e notificações.",
    complexity: 45,
    duration: 25,
    cost: 15000,
    deliverables: ["Mapeamento de processos", "Workflows", "Integrações"],
    dependencies: ["Processos documentados", "APIs disponíveis"],
  },
  dashboard: {
    title: "Dashboard Executivo",
    description: "Painel de indicadores e métricas para tomada de decisão.",
    proposedSolution: "Dashboard com KPIs, gráficos e alertas em tempo real.",
    complexity: 50,
    duration: 35,
    cost: 20000,
    deliverables: ["KPIs definidos", "Visualizações", "Alertas", "Exportação"],
    dependencies: ["Fontes de dados", "Métricas aprovadas"],
  },
  integration: {
    title: "Integração de Sistemas",
    description: "Integração entre sistemas internos e ferramentas externas.",
    proposedSolution: "APIs e conectores para sincronização de dados entre plataformas.",
    complexity: 60,
    duration: 40,
    cost: 25000,
    deliverables: ["APIs", "Conectores", "Monitoramento", "Documentação"],
    dependencies: ["Acesso às APIs", "Mapeamento de dados"],
  },
  internal_process: {
    title: "Processo Interno Digitalizado",
    description: "Digitalização e otimização de processo interno da empresa.",
    proposedSolution: "Fluxo digital com aprovações, rastreabilidade e auditoria.",
    complexity: 40,
    duration: 30,
    cost: 14000,
    deliverables: ["Fluxo digital", "Aprovações", "Auditoria", "Treinamento básico"],
    dependencies: ["Processo atual mapeado", "Stakeholders definidos"],
  },
};

const TYPE_KEYWORDS: Array<{ keywords: string[]; type: ProjectType }> = [
  { keywords: ["website", "site", "landing"], type: "website" },
  { keywords: ["mobile", "app", "aplicativo"], type: "mobile_app" },
  { keywords: ["sistema web", "web system", "plataforma web"], type: "web_system" },
  { keywords: ["crm", "cliente", "vendas"], type: "crm" },
  { keywords: ["agendamento", "scheduling", "agenda"], type: "scheduling" },
  { keywords: ["delivery", "entrega", "pedido"], type: "delivery" },
  { keywords: ["fidelização", "fidelidade", "loyalty", "pontos"], type: "loyalty" },
  { keywords: ["automação", "automation", "workflow"], type: "automation" },
  { keywords: ["dashboard", "painel", "kpi", "indicador"], type: "dashboard" },
  { keywords: ["integração", "integration", "api"], type: "integration" },
  { keywords: ["processo interno", "internal process", "operacional"], type: "internal_process" },
];

function inferProjectType(input: ProjectGenerationInput): ProjectType {
  if (input.projectType) return input.projectType;

  const text = `${input.businessProblem} ${input.proposedSolution ?? ""} ${(input.tags ?? []).join(" ")}`.toLowerCase();

  for (const entry of TYPE_KEYWORDS) {
    if (entry.keywords.some((keyword) => text.includes(keyword))) {
      return entry.type;
    }
  }

  return "web_system";
}

export class DefaultProjectGenerator implements ProjectGenerator {
  generate(input: ProjectGenerationInput): ExecutiveProject {
    const projectType = inferProjectType(input);
    const template = PROJECT_TEMPLATES[projectType];
    const expectedImpact = input.expectedImpact ?? 60;
    const approvalRequired = expectedImpact >= 65 || template.cost >= 30000;

    return ExecutiveProject.create({
      companyId: input.companyId,
      projectType,
      title: input.title ?? template.title,
      description: input.description ?? template.description,
      businessProblem: input.businessProblem,
      proposedSolution: input.proposedSolution ?? template.proposedSolution,
      expectedImpact,
      estimatedROI: input.estimatedROI ?? 0,
      estimatedCost: input.estimatedCost ?? template.cost,
      estimatedDuration: input.estimatedDuration ?? template.duration,
      priority: Math.min(100, expectedImpact + 10),
      complexity: template.complexity,
      risk: template.complexity >= 70 ? "high" : template.complexity >= 50 ? "medium" : "low",
      approvalRequired,
      status: approvalRequired ? "pending_approval" : "draft",
      milestones: [],
      deliverables: template.deliverables,
      dependencies: template.dependencies,
      relatedInnovation: input.relatedInnovation ?? [],
      relatedKnowledge: input.relatedKnowledge ?? [],
      relatedLearning: input.relatedLearning ?? [],
      relatedWisdom: input.relatedWisdom ?? [],
    });
  }
}
