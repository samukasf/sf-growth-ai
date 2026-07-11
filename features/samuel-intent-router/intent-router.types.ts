/**
 * Tipos públicos do Samuel Intent Router.
 *
 * IMPORTANTE (separação idioma × classificação, exigida na Sprint 75):
 * nenhum tipo neste arquivo carrega palavras-chave ou padrões de um idioma
 * específico. `IntentLanguageRule` é o contrato que qualquer idioma
 * (pt/en/es/...) implementa para produzir `IntentSignal`s; o motor de
 * classificação (`intent-classification.engine.ts`) só conhece esses sinais
 * — nunca texto em português diretamente.
 */

/** Categorias de intenção suportadas hoje. Extensível: ver `IntentLanguageRule`. */
export type IntentCategory =
  | "BUSINESS"
  | "GENERAL_KNOWLEDGE"
  | "HYBRID"
  | "AUTOMATION"
  | "ANALYSIS"
  | "CREATION";

/** Código de idioma (BCP-47 simplificado). Não é um union fechado — novos idiomas não exigem alterar este tipo. */
export type IntentLanguageCode = string;

/** Resultado devolvido pelo Router: apenas classificação, nunca execução. */
export type IntentClassificationResult = {
  category: IntentCategory;
  /** 0–1. Margem de confiança entre a categoria vencedora e a segunda colocada. */
  confidence: number;
  /** Explicação legível de por que essa categoria foi escolhida. */
  justification: string;
};

/**
 * Sinal linguístico atômico: "encontrei evidência de `category` com força
 * `strength`". É a única coisa que atravessa a fronteira idioma → motor.
 */
export type IntentSignal = {
  category: IntentCategory;
  /** 0–1. Força/confiabilidade deste sinal isolado. */
  strength: number;
  reason: string;
};

/**
 * Uma regra linguística: função pura que tenta detectar evidência de uma
 * categoria num texto já normalizado. Implementações vivem em `languages/*`
 * e nunca são compartilhadas mutáveis — cada regra é um objeto imutável.
 */
export interface IntentLanguageRule {
  readonly id: string;
  readonly category: IntentCategory;
  detect(normalizedQuery: string): IntentSignal | null;
}

/** Conjunto imutável de regras de um idioma. */
export type IntentLanguageRuleSet = {
  readonly language: IntentLanguageCode;
  readonly rules: ReadonlyArray<IntentLanguageRule>;
};

/** Contrato público do classificador. */
export interface IntentClassifier {
  classify(query: string, language?: IntentLanguageCode): IntentClassificationResult;
}
