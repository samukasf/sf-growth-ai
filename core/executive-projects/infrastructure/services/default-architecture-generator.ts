import {
  ProjectArchitecture,
  type ArchitectureGenerator,
  type ExecutiveProject,
} from "../../domain";

const ARCHITECTURE_BY_TYPE: Record<
  ExecutiveProject["projectType"],
  { pattern: string; technologies: string[]; integrations: string[] }
> = {
  website: {
    pattern: "Jamstack",
    technologies: ["Next.js", "Tailwind CSS", "Headless CMS"],
    integrations: ["Google Analytics", "Form provider"],
  },
  mobile_app: {
    pattern: "Clean Architecture + MVVM",
    technologies: ["React Native", "TypeScript", "REST API"],
    integrations: ["Push notifications", "Auth provider"],
  },
  web_system: {
    pattern: "Clean Architecture + DDD",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
    integrations: ["Auth", "Email service"],
  },
  crm: {
    pattern: "Modular Monolith",
    technologies: ["Next.js", "PostgreSQL", "Redis"],
    integrations: ["Email", "WhatsApp API", "Calendar"],
  },
  scheduling: {
    pattern: "Event-Driven",
    technologies: ["Next.js", "PostgreSQL", "Queue"],
    integrations: ["WhatsApp", "Email", "Calendar"],
  },
  delivery: {
    pattern: "Microservices",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis"],
    integrations: ["Payment gateway", "Maps API", "Push notifications"],
  },
  loyalty: {
    pattern: "Domain-Driven Design",
    technologies: ["Next.js", "PostgreSQL", "Redis"],
    integrations: ["POS", "Email marketing"],
  },
  automation: {
    pattern: "Workflow Engine",
    technologies: ["Node.js", "Queue", "Webhooks"],
    integrations: ["ERP", "CRM", "Spreadsheets"],
  },
  dashboard: {
    pattern: "CQRS + Read Models",
    technologies: ["Next.js", "PostgreSQL", "Chart library"],
    integrations: ["Data warehouse", "APIs internas"],
  },
  integration: {
    pattern: "API Gateway + Adapters",
    technologies: ["Node.js", "REST", "Webhooks"],
    integrations: ["ERP", "CRM", "Payment", "External APIs"],
  },
  internal_process: {
    pattern: "Workflow + Approval Chain",
    technologies: ["Next.js", "PostgreSQL", "Workflow engine"],
    integrations: ["Email", "Internal LDAP"],
  },
};

export class DefaultArchitectureGenerator implements ArchitectureGenerator {
  generate(project: ExecutiveProject): ProjectArchitecture {
    const config = ARCHITECTURE_BY_TYPE[project.projectType];

    return ProjectArchitecture.create({
      companyId: project.companyId,
      projectId: project.id,
      pattern: config.pattern,
      layers: ["presentation", "application", "domain", "infrastructure"],
      technologies: config.technologies,
      integrations: config.integrations,
      description: `Arquitetura ${config.pattern} para ${project.title}.`,
    });
  }
}
