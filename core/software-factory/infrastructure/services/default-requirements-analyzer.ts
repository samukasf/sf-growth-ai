import {
  BusinessRequirements,
  FunctionalRequirements,
  TechnicalRequirements,
  type AnalyzeRequirementsInput,
  type AnalyzeRequirementsOutput,
  type RequirementsAnalyzer,
} from "../../domain";

export class DefaultRequirementsAnalyzer implements RequirementsAnalyzer {
  analyze(input: AnalyzeRequirementsInput): AnalyzeRequirementsOutput {
    const { project } = input;

    const businessRequirements = BusinessRequirements.create({
      projectId: project.id,
      problemStatement: project.businessProblem,
      goals: project.businessGoals,
      stakeholders: ["executive", "operations", "technology"],
    });

    const functionalRequirements = FunctionalRequirements.create({
      projectId: project.id,
      items: project.functionalRequirements.length
        ? project.functionalRequirements
        : ["Autenticação", "Gestão de dados", "Relatórios", "Auditoria"],
      userFlows: ["Cadastro", "Operação principal", "Consulta de relatórios"],
      integrations: ["ERP/CRM", "Email", "Analytics"],
    });

    const technicalRequirements = TechnicalRequirements.create({
      projectId: project.id,
      stackPreferences: ["Next.js", "TypeScript", "Supabase"],
      constraints: ["Sem IA externa nesta sprint", "Arquitetura apenas", "Compatível com runtime atual"],
      securityRequirements: ["Controle de acesso", "Logs de auditoria", "Proteção de dados"],
      nonFunctionalRequirements: ["Escalabilidade", "Observabilidade", "Performance básica"],
    });

    return { businessRequirements, functionalRequirements, technicalRequirements };
  }
}

