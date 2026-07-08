import { ExecutiveProject, ProjectProposal } from "../../domain";
import type { ProjectPlanner, ProjectPlannerInput } from "../../domain";
import type { ProjectPriorityLevel, ProjectRiskLevel, ProjectType } from "../../shared";

const TYPE_BLUEPRINTS: Record<
  ProjectType,
  { solution: string; benefits: string[]; resources: string[]; departments: string[] }
> = {
  create_website: {
    solution: "Website moderno com SEO, landing pages e tracking de conversão.",
    benefits: ["Aumento de leads", "Melhor reputação online", "Base para campanhas"],
    resources: ["Design", "Dev Frontend", "Analytics"],
    departments: ["marketing", "technology"],
  },
  create_app: {
    solution: "Aplicativo com funcionalidades centrais e onboarding.",
    benefits: ["Melhor experiência", "Engajamento", "Canal direto com clientes"],
    resources: ["Dev Mobile", "Design UX", "Backend/API"],
    departments: ["technology", "customer_success"],
  },
  create_customer_portal: {
    solution: "Portal do cliente com suporte, pedidos e autoatendimento.",
    benefits: ["Redução de suporte", "Satisfação do cliente", "Retenção"],
    resources: ["Dev Web", "Integrações", "CX"],
    departments: ["customer_success", "technology"],
  },
  create_internal_system: {
    solution: "Sistema interno para padronizar e automatizar fluxos operacionais.",
    benefits: ["Eficiência", "Redução de erros", "Visibilidade operacional"],
    resources: ["Dev Fullstack", "Product Owner", "Ops"],
    departments: ["operations", "technology"],
  },
  create_executive_dashboard: {
    solution: "Dashboard executivo com KPIs críticos e alertas.",
    benefits: ["Decisão rápida", "Transparência", "Gestão por dados"],
    resources: ["BI", "Data/ETL", "UX"],
    departments: ["finance", "technology"],
  },
  create_automations: {
    solution: "Automatizações de processos repetitivos com integrações e monitorização.",
    benefits: ["Redução de custos", "Escalabilidade", "Menos retrabalho"],
    resources: ["Automation Engineer", "Ops", "Integrações"],
    departments: ["operations", "technology"],
  },
  create_crm: {
    solution: "CRM com pipeline, automações e relatórios.",
    benefits: ["Aumento de conversão", "Previsibilidade", "Produtividade comercial"],
    resources: ["CRM Specialist", "Sales Ops", "Integrações"],
    departments: ["sales", "marketing"],
  },
  create_loyalty_program: {
    solution: "Programa de fidelidade com regras, benefícios e comunicação.",
    benefits: ["Retenção", "LTV maior", "Recompras"],
    resources: ["Marketing", "CX", "Data"],
    departments: ["marketing", "customer_success"],
  },
  create_scheduling_system: {
    solution: "Sistema de agendamento com confirmações e integração de calendário.",
    benefits: ["Menos faltas", "Eficiência", "Melhor experiência"],
    resources: ["Dev", "Integrações", "Ops"],
    departments: ["operations", "technology"],
  },
  create_ecommerce: {
    solution: "E-commerce com catálogo, checkout e integrações de pagamento.",
    benefits: ["Novo canal de receita", "Escala", "Dados de comportamento"],
    resources: ["Dev", "UX", "Pagamentos"],
    departments: ["sales", "technology"],
  },
  create_integration: {
    solution: "Integração entre sistemas para unificar dados e reduzir retrabalho.",
    benefits: ["Eficiência", "Menos erros", "Visão 360º"],
    resources: ["Dev Backend", "Integrações", "Segurança"],
    departments: ["technology"],
  },
  create_virtual_assistant: {
    solution: "Assistente virtual baseado em regras e fluxos (sem IA externa) para triagem e suporte.",
    benefits: ["Resposta rápida", "Redução de carga", "Padronização"],
    resources: ["CX", "Dev", "Conteúdo"],
    departments: ["customer_success", "technology"],
  },
};

export class DefaultProjectPlanner implements ProjectPlanner {
  propose(input: ProjectPlannerInput): ProjectProposal {
    const { opportunity, projectType } = input;
    const blueprint = TYPE_BLUEPRINTS[projectType];
    return ProjectProposal.create({
      opportunityId: opportunity.id,
      projectType,
      title: `${blueprint ? blueprint.solution.split(" ").slice(0, 3).join(" ") : "Projeto"} — ${opportunity.title}`,
      description: `Projeto proposto para capturar oportunidade: ${opportunity.title}`,
      problem: `Problema/oportunidade: ${opportunity.description}`,
      solution: blueprint?.solution ?? "Solução proposta baseada em boas práticas.",
      expectedBenefits: blueprint?.benefits ?? ["Benefícios a validar"],
      departments: blueprint?.departments ?? ["operations", "technology"],
      requiredResources: blueprint?.resources ?? ["Time dedicado", "Stakeholders", "Dados"],
    });
  }

  materializeProject(input: {
    opportunity: import("../../domain").ProjectOpportunity;
    proposal: import("../../domain").ProjectProposal;
    priority: ProjectPriorityLevel;
    riskLevel: ProjectRiskLevel;
    businessImpact: number;
    estimatedInvestment: number;
    estimatedROI: number;
    estimatedTime: number;
    roadmap: import("../../domain").ProjectRoadmap | null;
  }): ExecutiveProject {
    const { opportunity, proposal } = input;
    return ExecutiveProject.create({
      organizationId: opportunity.organizationId,
      companyId: opportunity.companyId,
      title: proposal.title,
      description: proposal.description,
      problem: proposal.problem,
      solution: proposal.solution,
      expectedBenefits: proposal.expectedBenefits,
      estimatedInvestment: input.estimatedInvestment,
      estimatedROI: input.estimatedROI,
      estimatedTime: input.estimatedTime,
      priority: input.priority,
      riskLevel: input.riskLevel,
      businessImpact: input.businessImpact,
      departments: proposal.departments,
      requiredResources: proposal.requiredResources,
      implementationRoadmap: input.roadmap ? input.roadmap.toJSON() : null,
    });
  }
}

