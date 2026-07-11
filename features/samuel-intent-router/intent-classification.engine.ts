/**
 * Motor de classificação — 100% agnóstico de idioma.
 *
 * Este arquivo NUNCA deve importar ou referenciar palavras-chave/padrões de
 * um idioma específico. Ele só sabe agregar `IntentSignal[]` (já produzidos
 * por regras linguísticas injetadas de fora) em um `IntentClassificationResult`.
 * Isso é o que permite adicionar `en`, `es`, etc. no futuro sem tocar aqui.
 */
import type { IntentCategory, IntentClassificationResult, IntentSignal } from "./intent-router.types";

/** Categoria de fallback quando nenhuma regra linguística produz sinal. */
const FALLBACK_CATEGORY: IntentCategory = "GENERAL_KNOWLEDGE";
const FALLBACK_CONFIDENCE = 0.2;
const FALLBACK_JUSTIFICATION =
  "Nenhum sinal linguístico forte foi identificado; classificado como padrão de baixa confiança.";

/**
 * Agrega sinais detectados por categoria, soma as forças e escolhe a
 * categoria de maior pontuação. A confiança reflete a margem entre a
 * categoria vencedora e a segunda colocada — sinais isolados e
 * inequívocos geram confiança alta; sinais concorrentes e próximos geram
 * confiança baixa (ambiguidade real).
 */
export function aggregateIntentSignals(signals: readonly IntentSignal[]): IntentClassificationResult {
  if (signals.length === 0) {
    return {
      category: FALLBACK_CATEGORY,
      confidence: FALLBACK_CONFIDENCE,
      justification: FALLBACK_JUSTIFICATION,
    };
  }

  const scoreByCategory = new Map<IntentCategory, number>();
  const reasonsByCategory = new Map<IntentCategory, string[]>();

  for (const signal of signals) {
    scoreByCategory.set(signal.category, (scoreByCategory.get(signal.category) ?? 0) + signal.strength);
    const reasons = reasonsByCategory.get(signal.category) ?? [];
    reasons.push(signal.reason);
    reasonsByCategory.set(signal.category, reasons);
  }

  const ranked = Array.from(scoreByCategory.entries()).sort((a, b) => b[1] - a[1]);
  const [winnerCategory, winnerScore] = ranked[0];
  const runnerUpScore = ranked[1]?.[1] ?? 0;

  const confidence = computeConfidence(winnerScore, runnerUpScore);
  const justification = (reasonsByCategory.get(winnerCategory) ?? []).join("; ");

  return {
    category: winnerCategory,
    confidence,
    justification: justification || FALLBACK_JUSTIFICATION,
  };
}

/**
 * Confiança 0–1: cresce com a pontuação absoluta da categoria vencedora e
 * com a margem relativa sobre a segunda colocada. Evita valores > 1 mesmo
 * quando várias regras da mesma categoria se reforçam.
 */
function computeConfidence(winnerScore: number, runnerUpScore: number): number {
  const total = winnerScore + runnerUpScore;
  const margin = total > 0 ? (winnerScore - runnerUpScore) / total : 0;
  const magnitude = Math.min(winnerScore, 1);
  const confidence = magnitude * (0.5 + margin / 2);

  return Math.max(0, Math.min(1, roundToTwoDecimals(confidence)));
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
