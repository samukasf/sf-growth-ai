/**
 * Regras linguísticas — português (Brasil).
 *
 * Único idioma implementado nesta sprint. Toda a lógica específica de
 * português (palavras-chave, padrões) fica isolada aqui — o motor de
 * classificação (`intent-classification.engine.ts`) nunca importa nada
 * deste arquivo diretamente, só recebe os `IntentSignal[]` já produzidos.
 *
 * Para adicionar um novo idioma no futuro: criar `languages/en.rules.ts` (ou
 * `es.rules.ts`, etc.) seguindo o mesmo contrato `IntentLanguageRuleSet` e
 * registrá-lo em `languages/index.ts`. Nenhum arquivo fora de `languages/`
 * precisa mudar.
 */
import type { IntentLanguageRule, IntentLanguageRuleSet, IntentSignal } from "../intent-router.types";

const CREATION_VERB =
  /\b(crie|criar|desenvolva|desenvolver|elabore|elaborar|monte|montar|fa[cç]a|fazer|construa|construir|gere|gerar)\b/;

const STRATEGIC_BUSINESS_NOUN =
  /\b(plano de marketing|plano de neg[oó]cios?|plano estrat[eé]gico|estrat[eé]gia|or[cç]amento|campanha de marketing)\b/;

const DIGITAL_ARTIFACT_NOUN =
  /\b(site|aplicativo|app|landing page|logo|v[ií]deo|imagem|conte[uú]do|texto|an[uú]ncio|banner|p[aá]gina)\b/;

const BUSINESS_CONTEXT =
  /\b(minha empresa|meu neg[oó]cio|na minha empresa|no meu neg[oó]cio|nossa empresa|nosso neg[oó]cio)\b/;

const EXPLANATION_CUE = /\b(explique|explicar|ensine|ensinar|defina|definir|o que e)\b/;

const ROUTINE_VERB = /\b(responda|responder|agende|agendar|envie|enviar|automatize|automatizar|organize|organizar)\b/;

const ROUTINE_NOUN = /\b(e-?mails?|mensagens?|agenda|tarefas?|whatsapp|calend[aá]rio)\b/;

const ANALYSIS_VERB = /\b(analise|analisar|avalie|avaliar|diagnostique|diagnosticar|examine|examinar)\b/;

const METRIC_NOUN = /\b(faturamento|vendas|desempenho|m[eé]tricas?|resultados?|receita|lucro|kpis?)\b/;

const MATH_EXPRESSION = /\d+\s*[x×*÷/+\-]\s*\d+/;

const FACTUAL_QUESTION_START = /^(quanto|quantos|quantas|quem|onde|quando|qual|quais)\b/;

function rule(
  id: string,
  category: IntentLanguageRule["category"],
  test: (text: string) => boolean,
  strength: number,
  reason: string,
): IntentLanguageRule {
  return Object.freeze({
    id,
    category,
    detect(normalizedQuery: string): IntentSignal | null {
      if (!test(normalizedQuery)) return null;
      return { category, strength, reason };
    },
  });
}

const RULES: ReadonlyArray<IntentLanguageRule> = Object.freeze([
  rule(
    "pt.general_knowledge.math_expression",
    "GENERAL_KNOWLEDGE",
    (text) => MATH_EXPRESSION.test(text),
    0.9,
    "Padrão matemático detectado (operação entre números).",
  ),
  rule(
    "pt.general_knowledge.factual_question",
    "GENERAL_KNOWLEDGE",
    (text) => FACTUAL_QUESTION_START.test(text),
    0.5,
    "Pergunta factual genérica, sem menção a contexto de negócio.",
  ),
  rule(
    "pt.general_knowledge.explanation_without_business",
    "GENERAL_KNOWLEDGE",
    (text) => EXPLANATION_CUE.test(text) && !BUSINESS_CONTEXT.test(text),
    0.55,
    "Pedido de explicação de um conceito, sem aplicação a um negócio específico.",
  ),
  rule(
    "pt.hybrid.explanation_applied_to_business",
    "HYBRID",
    (text) => EXPLANATION_CUE.test(text) && BUSINESS_CONTEXT.test(text),
    0.9,
    "Pedido de explicação de um conceito combinado com aplicação ao negócio do usuário.",
  ),
  rule(
    "pt.business.strategic_creation",
    "BUSINESS",
    (text) => CREATION_VERB.test(text) && STRATEGIC_BUSINESS_NOUN.test(text),
    0.9,
    "Verbo de criação combinado com artefato estratégico de negócio (plano, estratégia, orçamento).",
  ),
  rule(
    "pt.business.context_mentioned",
    "BUSINESS",
    (text) => BUSINESS_CONTEXT.test(text),
    0.35,
    "Menção direta à empresa/negócio do usuário.",
  ),
  rule(
    "pt.automation.routine_task",
    "AUTOMATION",
    (text) => ROUTINE_VERB.test(text) && ROUTINE_NOUN.test(text),
    0.9,
    "Verbo de execução recorrente combinado com tarefa rotineira (e-mails, mensagens, agenda).",
  ),
  rule(
    "pt.analysis.business_metric",
    "ANALYSIS",
    (text) => ANALYSIS_VERB.test(text) && METRIC_NOUN.test(text),
    0.9,
    "Verbo analítico combinado com métrica de negócio (faturamento, vendas, desempenho).",
  ),
  rule(
    "pt.creation.digital_artifact",
    "CREATION",
    (text) => CREATION_VERB.test(text) && DIGITAL_ARTIFACT_NOUN.test(text),
    0.9,
    "Verbo de criação combinado com artefato digital/tangível (site, app, vídeo, conteúdo).",
  ),
]);

export const PT_BR_INTENT_RULE_SET: IntentLanguageRuleSet = Object.freeze({
  language: "pt",
  rules: RULES,
});
