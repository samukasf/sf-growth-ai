export { IntentRouter, createIntentRouter, classifyIntent } from "./intent-router";
export type { CreateIntentRouterOptions } from "./intent-router";
export { aggregateIntentSignals } from "./intent-classification.engine";
export { normalizeIntentQuery } from "./intent-normalizer";
export { DEFAULT_INTENT_RULE_SETS, PT_BR_INTENT_RULE_SET } from "./languages";
export type {
  IntentCategory,
  IntentClassificationResult,
  IntentClassifier,
  IntentLanguageCode,
  IntentLanguageRule,
  IntentLanguageRuleSet,
  IntentSignal,
} from "./intent-router.types";
