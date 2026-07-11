import { createAIProvider } from "@/core/ai-provider";

import type {
  SpecialistOpinionInput,
  SpecialistOpinionResult,
  SpecialistPort,
} from "../../domain/ports/opinion-collector.port";
import type { CouncilSpecialistRole } from "../../shared";

/**
 * Especialistas do Executive Council que produzem pareceres reais via AI
 * Gateway (`@/core/ai-provider`), um por conselheiro (Sprint 78).
 *
 * Segue exatamente o mesmo padrão já usado em
 * `features/samuel-runtime/ai-gateway-narrative.adapter.ts`: chama a
 * operação pública `generateStructuredOutput` do Gateway (nenhuma alteração
 * no núcleo do AI Gateway) e nunca engole a responsabilidade de tratar
 * falhas — cada `provideOpinion()` **lança** em caso de erro; é o
 * `OpinionCollector` (chamador) quem isola cada conselheiro e decide
 * registrar o erro e seguir com os demais pareceres.
 */

const DEFAULT_TIMEOUT_MS = 8000;

const ROLE_LABELS: Record<CouncilSpecialistRole, string> = {
  ceo: "CEO",
  finance: "Financeiro",
  marketing: "Marketing",
  sales: "Vendas",
  operations: "Operações",
  hr: "RH",
  legal: "Jurídico",
  crm: "CRM",
  communication: "Comunicação",
  commerce: "Comércio",
  scheduling: "Agendamento",
  innovation: "Inovação",
  projects: "Projetos",
};

/** Chaves solicitadas ao Gateway — mapeiam 1:1 para o parecer exigido nesta Sprint. */
const OPINION_SCHEMA: Record<string, string> = {
  conclusao: "Conclusão objetiva do parecer deste conselheiro, em 1 a 2 frases",
  justificativa:
    "Justificativa/racional da conclusão, conectando a pergunta com o contexto da empresa",
  riscos: "Riscos identificados sob esta perspectiva, cada um separado por ';'",
  oportunidades: "Oportunidades identificadas sob esta perspectiva, cada uma separada por ';'",
  nivel_confianca: "Nível de confiança do parecer, um número inteiro de 0 a 100",
  prioridade: "Prioridade estratégica deste parecer para a organização, um número inteiro de 0 a 100",
};

function isCouncilAIEnabled(): boolean {
  return process.env.EXECUTIVE_COUNCIL_AI_ENABLED !== "false";
}

function resolvePreferredProviderType(): string | undefined {
  return process.env.EXECUTIVE_COUNCIL_AI_PREFERRED_PROVIDER || undefined;
}

function readContextString(context: Record<string, unknown>, key: string): string | undefined {
  const value = context[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readContextList(context: Record<string, unknown>, key: string): string[] {
  const value = context[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function buildSpecialistPrompt(
  label: string,
  companyName: string,
  input: SpecialistOpinionInput,
): string {
  const priorities = readContextList(input.context, "priorities");
  const risks = readContextList(input.context, "risks");
  const opportunities = readContextList(input.context, "opportunities");

  const sections = [
    `Você é o conselheiro de ${label} do Executive Council de "${companyName}".`,
    `Analise a solicitação abaixo estritamente do ponto de vista de ${label} e produza um parecer independente — não assuma o papel de outros especialistas.`,
    "",
    `Solicitação: ${input.query}`,
    priorities.length > 0 ? `Prioridades já identificadas pelo Company Brain: ${priorities.join("; ")}` : "",
    risks.length > 0 ? `Riscos já identificados pelo Company Brain: ${risks.join("; ")}` : "",
    opportunities.length > 0
      ? `Oportunidades já identificadas pelo Company Brain: ${opportunities.join("; ")}`
      : "",
  ];

  return sections.filter((line) => line.length > 0).join("\n");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`AI Gateway excedeu o timeout de ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function parseOptionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(";")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function parseScore(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

/**
 * Cria um `SpecialistPort` que produz o parecer de um papel via AI Gateway.
 * Lança em qualquer falha (Gateway indisponível, timeout, IA desabilitada
 * via kill-switch) — o isolamento por conselheiro é responsabilidade de
 * quem chama `provideOpinion()` (ver `DefaultOpinionCollector`).
 */
function createAISpecialist(role: CouncilSpecialistRole, label: string): SpecialistPort {
  return {
    role,
    async provideOpinion(input: SpecialistOpinionInput): Promise<SpecialistOpinionResult> {
      if (!isCouncilAIEnabled()) {
        throw new Error(
          `IA do Executive Council desabilitada (EXECUTIVE_COUNCIL_AI_ENABLED=false) — parecer de ${label} não gerado.`,
        );
      }

      const organizationId = readContextString(input.context, "organizationId") ?? "default-org";
      const companyId = readContextString(input.context, "companyId") ?? "";
      const companyName = readContextString(input.context, "companyName") ?? "a empresa";

      const gateway = createAIProvider();
      const prompt = buildSpecialistPrompt(label, companyName, input);

      const result = await withTimeout(
        gateway.executeRequest({
          organizationId,
          operation: "generateStructuredOutput",
          prompt,
          schema: OPINION_SCHEMA,
          preferredType: resolvePreferredProviderType(),
          enableFallback: true,
          context: {
            role,
            companyId,
            companyName,
            source: "executive-council",
          },
        }),
        DEFAULT_TIMEOUT_MS,
      );

      const structured = result.response.structuredOutput ?? {};
      const conclusion = parseOptionalText(structured.conclusao);
      const justification = parseOptionalText(structured.justificativa);

      return {
        summary: justification ?? `[${label}] Parecer sem justificativa retornada pela IA.`,
        recommendation: conclusion ?? `${label} não retornou uma conclusão válida.`,
        priority: parseScore(structured.prioridade, 50),
        confidence: parseScore(structured.nivel_confianca, 50),
        risks: parseList(structured.riscos),
        opportunities: parseList(structured.oportunidades),
        conclusion,
        justification,
        providerId: result.providerId,
        model: result.request.model,
      };
    },
  };
}

/**
 * Especialistas oficiais do Executive Council (Sprint 78) — cada papel
 * (exceto CEO, que nunca emite parecer, ver `DefaultOpinionCollector`)
 * produz seu parecer via AI Gateway, de forma isolada e independente.
 */
export function createAISpecialists(): SpecialistPort[] {
  return [
    createAISpecialist("finance", ROLE_LABELS.finance),
    createAISpecialist("marketing", ROLE_LABELS.marketing),
    createAISpecialist("sales", ROLE_LABELS.sales),
    createAISpecialist("operations", ROLE_LABELS.operations),
    createAISpecialist("hr", ROLE_LABELS.hr),
    createAISpecialist("legal", ROLE_LABELS.legal),
    createAISpecialist("crm", ROLE_LABELS.crm),
    createAISpecialist("communication", ROLE_LABELS.communication),
    createAISpecialist("commerce", ROLE_LABELS.commerce),
    createAISpecialist("scheduling", ROLE_LABELS.scheduling),
    createAISpecialist("innovation", ROLE_LABELS.innovation),
    createAISpecialist("projects", ROLE_LABELS.projects),
  ];
}

export { isCouncilAIEnabled };
