/**
 * IntentRouter — primeira etapa obrigatória do Samuel: apenas classifica.
 *
 * Não executa ações, não chama IA, não chama Company Brain, não chama
 * Executive Council. Isso é garantido estruturalmente: esta classe não tem
 * nenhuma dependência de módulos externos, só do motor de classificação e
 * das regras que lhe são passadas.
 *
 * Regra de design obrigatória (Sprint 75): nenhum registro global mutável.
 * As `IntentLanguageRuleSet[]` são recebidas uma única vez no construtor (ou
 * via `createIntentRouter`) e nunca modificadas depois — cada instância
 * carrega sua própria referência imutável, então:
 *   - testes não contaminam uns aos outros (cada teste cria seu próprio router);
 *   - não há como "registrar" a mesma regra duas vezes em tempo de execução;
 *   - duas requisições concorrentes usando o mesmo router observam
 *     exatamente as mesmas regras, sempre — nenhuma mutação em voo;
 *   - não existe estado compartilhado para proteger contra corrida.
 */
import { aggregateIntentSignals } from "./intent-classification.engine";
import { normalizeIntentQuery } from "./intent-normalizer";
import { DEFAULT_INTENT_RULE_SETS } from "./languages";

import type {
  IntentClassificationResult,
  IntentClassifier,
  IntentLanguageCode,
  IntentLanguageRuleSet,
} from "./intent-router.types";

export class IntentRouter implements IntentClassifier {
  private readonly ruleSets: ReadonlyArray<IntentLanguageRuleSet>;

  constructor(ruleSets: ReadonlyArray<IntentLanguageRuleSet>) {
    this.ruleSets = Object.freeze([...ruleSets]);
  }

  classify(query: string, language: IntentLanguageCode = "pt"): IntentClassificationResult {
    const ruleSet = this.ruleSets.find((set) => set.language === language) ?? this.ruleSets[0];

    if (!ruleSet) {
      return aggregateIntentSignals([]);
    }

    const normalized = normalizeIntentQuery(query ?? "");
    const signals = ruleSet.rules
      .map((rule) => rule.detect(normalized))
      .filter((signal): signal is NonNullable<typeof signal> => signal !== null);

    return aggregateIntentSignals(signals);
  }
}

export type CreateIntentRouterOptions = {
  /**
   * Conjuntos de regras a injetar. Default: apenas pt-BR (única
   * implementação desta sprint). Passe um array próprio nos testes para
   * garantir isolamento total entre casos.
   */
  ruleSets?: ReadonlyArray<IntentLanguageRuleSet>;
};

/** Factory — cada chamada produz uma instância nova e independente, sem estado compartilhado. */
export function createIntentRouter(options: CreateIntentRouterOptions = {}): IntentRouter {
  return new IntentRouter(options.ruleSets ?? DEFAULT_INTENT_RULE_SETS);
}

/**
 * Atalho para os chamadores que só precisam classificar uma vez (ex.: fase
 * `intent` do Samuel Runtime) sem gerenciar uma instância explicitamente.
 * Internamente usa a mesma factory — sem nenhum estado global mutável.
 */
export function classifyIntent(
  query: string,
  language: IntentLanguageCode = "pt",
): IntentClassificationResult {
  return createIntentRouter().classify(query, language);
}
