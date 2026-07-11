/**
 * Registro imutável de idiomas suportados pelo Intent Router.
 *
 * Nesta sprint só `pt` está implementado. Para adicionar `en`, `es`, etc.:
 *   1. criar `languages/en.rules.ts` (ou equivalente) exportando um
 *      `IntentLanguageRuleSet` próprio, seguindo o mesmo contrato;
 *   2. adicionar esse conjunto ao array abaixo.
 *
 * `DEFAULT_INTENT_RULE_SETS` é uma constante congelada (`Object.freeze`),
 * nunca mutada em runtime — não é um "registry" no sentido de algo que
 * pode receber `register(...)` a qualquer momento. Consumidores que
 * precisem de um conjunto diferente devem injetá-lo explicitamente via
 * `createIntentRouter({ ruleSets })`.
 */
import { PT_BR_INTENT_RULE_SET } from "./pt-br.rules";

import type { IntentLanguageRuleSet } from "../intent-router.types";

export const DEFAULT_INTENT_RULE_SETS: ReadonlyArray<IntentLanguageRuleSet> = Object.freeze([
  PT_BR_INTENT_RULE_SET,
]);

export { PT_BR_INTENT_RULE_SET };
