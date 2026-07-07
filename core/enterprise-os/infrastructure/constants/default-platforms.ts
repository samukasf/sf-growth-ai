import { EnterprisePlatform } from "../../domain";

export type DefaultPlatformDefinition = {
  name: string;
  slug: string;
  description: string;
  category: EnterprisePlatform["category"];
  modulePath: string;
  version: string;
  status?: EnterprisePlatform["status"];
};

export const REGISTERED_PLATFORMS: DefaultPlatformDefinition[] = [
  {
    name: "Business Communication Platform",
    slug: "business-communication",
    description: "Plataforma universal de comunicação empresarial",
    category: "communication",
    modulePath: "core/business-communication",
    version: "1.0.0",
  },
  {
    name: "Business Automation Platform",
    slug: "business-automation",
    description: "Plataforma universal de automação empresarial",
    category: "automation",
    modulePath: "core/business-automation",
    version: "1.0.0",
  },
  {
    name: "Executive CRM Platform",
    slug: "executive-crm",
    description: "Plataforma de CRM inteligente",
    category: "crm",
    modulePath: "core/executive-crm",
    version: "1.0.0",
  },
  {
    name: "Intelligent Scheduling Platform",
    slug: "intelligent-scheduling",
    description: "Plataforma inteligente de agendamento",
    category: "scheduling",
    modulePath: "core/intelligent-scheduling",
    version: "1.0.0",
  },
  {
    name: "Commerce Platform",
    slug: "commerce",
    description: "Plataforma comercial",
    category: "commerce",
    modulePath: "core/commerce",
    version: "1.0.0",
  },
  {
    name: "Executive Orchestrator",
    slug: "executive-orchestrator",
    description: "Motor de orquestração executiva",
    category: "orchestration",
    modulePath: "core/executive-orchestrator",
    version: "1.0.0",
  },
  {
    name: "Enterprise Brain",
    slug: "enterprise-brain",
    description: "Cérebro empresarial central",
    category: "intelligence",
    modulePath: "core/enterprise-brain",
    version: "1.0.0",
  },
];

export const FUTURE_PLATFORMS: DefaultPlatformDefinition[] = [
  {
    name: "Finance Platform",
    slug: "finance",
    description: "Plataforma financeira (futura)",
    category: "finance",
    modulePath: "core/finance",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "HR Platform",
    slug: "hr",
    description: "Plataforma de recursos humanos (futura)",
    category: "hr",
    modulePath: "core/hr",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "Marketing Platform",
    slug: "marketing",
    description: "Plataforma de marketing (futura)",
    category: "marketing",
    modulePath: "core/marketing",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "Sales Platform",
    slug: "sales",
    description: "Plataforma de vendas (futura)",
    category: "sales",
    modulePath: "core/sales",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "Legal Platform",
    slug: "legal",
    description: "Plataforma jurídica (futura)",
    category: "legal",
    modulePath: "core/legal",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "Analytics Platform",
    slug: "analytics",
    description: "Plataforma de analytics (futura)",
    category: "analytics",
    modulePath: "core/analytics",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "Software Factory",
    slug: "software-factory",
    description: "Fábrica de software (futura)",
    category: "factory",
    modulePath: "core/software-factory",
    version: "0.0.0",
    status: "planned",
  },
  {
    name: "Marketplace Platform",
    slug: "marketplace",
    description: "Plataforma marketplace (futura)",
    category: "marketplace",
    modulePath: "core/marketplace",
    version: "0.0.0",
    status: "planned",
  },
];

export function createDefaultPlatforms(organizationId: string): EnterprisePlatform[] {
  return [...REGISTERED_PLATFORMS, ...FUTURE_PLATFORMS].map((def) =>
    EnterprisePlatform.create({
      organizationId,
      name: def.name,
      slug: def.slug,
      description: def.description,
      category: def.category,
      modulePath: def.modulePath,
      version: def.version,
      status: def.status ?? "active",
      healthScore: def.status === "planned" ? 0 : 100,
    }),
  );
}
