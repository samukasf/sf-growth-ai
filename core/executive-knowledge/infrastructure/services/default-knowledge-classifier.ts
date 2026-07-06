import {
  KnowledgeCategory,
  type ClassificationInput,
  type ClassificationResult,
  type ExecutiveDomain,
  type KnowledgeClassifier,
  type KnowledgeRecord,
} from "../../domain";

const DOMAIN_KEYWORDS: Record<ExecutiveDomain, string[]> = {
  finance: ["finance", "financeiro", "caixa", "lucro", "margem", "roi", "receita", "custo"],
  marketing: ["marketing", "marca", "campanha", "cac", "conteudo", "ads", "anuncio"],
  operations: ["operac", "processo", "produtiv", "sla", "entrega", "logistica"],
  sales: ["venda", "sales", "pipeline", "crm", "lead", "conversao", "deal"],
  technology: ["tech", "sistema", "software", "api", "automacao", "dados"],
  hr: ["rh", "equipe", "cultura", "contratacao", "pessoas", "talento"],
  legal: ["jurid", "legal", "contrato", "compliance", "lgpd", "regulat"],
  market: ["mercado", "concorren", "tendencia", "setor", "economia"],
  strategy: ["estrateg", "visao", "objetivo", "prioridade", "crescimento"],
  general: [],
};

function detectDomain(text: string): ExecutiveDomain {
  const normalized = text.toLowerCase();

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [
    ExecutiveDomain,
    string[],
  ][]) {
    if (domain === "general") continue;
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return domain;
    }
  }

  return "general";
}

function detectCategoryKind(text: string): ClassificationResult["category"]["kind"] {
  const normalized = text.toLowerCase();

  if (normalized.includes("decis")) return "decision";
  if (normalized.includes("recomend")) return "recommendation";
  if (normalized.includes("result")) return "result";
  if (normalized.includes("aprend") || normalized.includes("lesson")) return "learning";
  if (normalized.includes("insight")) return "insight";
  if (normalized.includes("analise") || normalized.includes("analysis")) return "analysis";
  if (normalized.includes("acao") || normalized.includes("action")) return "action";
  if (normalized.includes("feedback")) return "feedback";
  if (normalized.includes("playbook")) return "playbook";

  return "fact";
}

export class DefaultKnowledgeClassifier implements KnowledgeClassifier {
  classify(input: ClassificationInput): ClassificationResult {
    const combined = [input.title, input.content, input.sourceOrigin ?? "", ...(input.tags ?? [])]
      .join(" ")
      .trim();

    const domain = detectDomain(combined);
    const kind = detectCategoryKind(combined);

    return {
      domain,
      category: KnowledgeCategory.create({
        kind,
        label: kind.replace(/_/g, " "),
        executiveDomain: domain,
      }),
      suggestedTags: this.extractTags(combined, domain, kind),
    };
  }

  classifyRecord(record: KnowledgeRecord): ClassificationResult {
    return this.classify({
      title: record.title,
      content: record.content,
      sourceOrigin: record.source.origin,
      tags: record.tags,
    });
  }

  private extractTags(
    text: string,
    domain: ExecutiveDomain,
    kind: string,
  ): string[] {
    const tags = new Set<string>([domain, kind]);
    const tokens = text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 5)
      .slice(0, 5);

    for (const token of tokens) {
      tags.add(token);
    }

    return [...tags];
  }
}
