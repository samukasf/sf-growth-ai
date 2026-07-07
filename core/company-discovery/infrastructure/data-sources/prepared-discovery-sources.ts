import { DiscoveryFinding } from "../../domain";
import type {
  DiscoverySourceProvider,
  SourceCollectionInput,
  SourceCollectionResult,
} from "../../domain";
import type { DiscoveryFindingCategory, DiscoverySourceType } from "../../shared";

type SourceTemplate = {
  sourceType: DiscoverySourceType;
  label: string;
  category: DiscoveryFindingCategory;
  findings: Array<{ key: string; label: string; value: string; confidence: number }>;
};

const GRAFGIL_TEMPLATES: SourceTemplate[] = [
  {
    sourceType: "website",
    label: "Website",
    category: "identity",
    findings: [
      { key: "identity:name", label: "Nome", value: "Grafgil Comunicação Visual", confidence: 85 },
      { key: "identity:sector", label: "Setor", value: "Comunicação visual B2B", confidence: 80 },
    ],
  },
  {
    sourceType: "google_business",
    label: "Google Business",
    category: "market",
    findings: [
      { key: "market:location", label: "Localização", value: "Maia, Grande Porto", confidence: 90 },
      { key: "market:rating", label: "Avaliação", value: "4.2/5 (38 reviews)", confidence: 75 },
    ],
  },
  {
    sourceType: "facebook",
    label: "Facebook",
    category: "marketing",
    findings: [
      { key: "marketing:facebook_followers", label: "Seguidores Facebook", value: "1.240", confidence: 70 },
    ],
  },
  {
    sourceType: "instagram",
    label: "Instagram",
    category: "marketing",
    findings: [
      { key: "marketing:instagram_followers", label: "Seguidores Instagram", value: "840", confidence: 70 },
    ],
  },
  {
    sourceType: "linkedin",
    label: "LinkedIn",
    category: "identity",
    findings: [
      { key: "identity:employees_range", label: "Colaboradores", value: "11–50", confidence: 65 },
    ],
  },
  {
    sourceType: "crm",
    label: "CRM",
    category: "customers",
    findings: [
      { key: "customers:active_count", label: "Clientes ativos", value: "180", confidence: 60 },
      { key: "customers:recurrence_rate", label: "Taxa de recorrência", value: "60%", confidence: 55 },
    ],
  },
  {
    sourceType: "erp",
    label: "ERP",
    category: "finance",
    findings: [
      { key: "finance:annual_revenue", label: "Faturação anual", value: "€2.800.000", confidence: 70 },
      { key: "finance:gross_margin", label: "Margem bruta", value: "42%", confidence: 65 },
    ],
  },
  {
    sourceType: "documents",
    label: "Documentos",
    category: "processes",
    findings: [
      { key: "processes:documented", label: "Processos documentados", value: "26%", confidence: 80 },
    ],
  },
  {
    sourceType: "employees",
    label: "Funcionários",
    category: "people",
    findings: [
      { key: "people:headcount", label: "Colaboradores", value: "34", confidence: 85 },
      { key: "people:departments", label: "Departamentos", value: "5", confidence: 80 },
    ],
  },
  {
    sourceType: "questionnaires",
    label: "Questionários",
    category: "operations",
    findings: [
      { key: "operations:main_challenge", label: "Principal desafio", value: "Gestão reativa e dados fragmentados", confidence: 75 },
    ],
  },
  {
    sourceType: "interviews",
    label: "Entrevistas",
    category: "operations",
    findings: [
      { key: "operations:ceo_bottleneck", label: "Gargalo CEO", value: "28h/semana em operacional", confidence: 80 },
    ],
  },
  {
    sourceType: "uploaded_files",
    label: "Arquivos enviados",
    category: "products",
    findings: [
      { key: "products:main_lines", label: "Linhas principais", value: "Print digital, sinalética, decoração", confidence: 70 },
    ],
  },
];

function createPreparedProvider(template: SourceTemplate): DiscoverySourceProvider {
  return {
    sourceType: template.sourceType,
    label: template.label,
    isAvailable(context: Record<string, unknown>) {
      if (context[`skip_${template.sourceType}`] === true) return false;
      if (context[`${template.sourceType}_endpoint`]) return true;
      return context.enableAllSources !== false;
    },
    async collect(input: SourceCollectionInput): Promise<SourceCollectionResult> {
      const findings = template.findings.map((f) =>
        DiscoveryFinding.create({
          sessionId: input.session.id,
          sourceType: template.sourceType,
          category: template.category,
          key: f.key,
          label: f.label,
          value: f.value,
          confidence: f.confidence,
        }),
      );

      return {
        findings,
        itemsCollected: findings.length,
        confidence: Math.round(
          findings.reduce((sum, f) => sum + f.confidence, 0) / Math.max(findings.length, 1),
        ),
        metadata: { prepared: true, sourceType: template.sourceType },
      };
    },
  };
}

export const PREPARED_DISCOVERY_SOURCES: DiscoverySourceProvider[] =
  GRAFGIL_TEMPLATES.map(createPreparedProvider);

export function createPreparedDiscoverySources(
  overrides?: Partial<Record<DiscoverySourceType, SourceTemplate>>,
): DiscoverySourceProvider[] {
  const templates = GRAFGIL_TEMPLATES.map((t) => overrides?.[t.sourceType] ?? t);
  return templates.map(createPreparedProvider);
}
