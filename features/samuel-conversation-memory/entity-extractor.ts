/**
 * Extração heurística de "entidades mencionadas" — determinística, sem IA.
 * Captura palavras iniciadas em maiúscula (nomes próprios, siglas como
 * "SEO") e números (com opcional separador decimal e "%"). A primeira
 * palavra da frase é ignorada mesmo quando capitalizada, para evitar
 * capturar verbos de abertura comuns ("Analise", "Crie", "Explique"...)
 * como se fossem entidades.
 */

const ENTITY_PATTERN = /\b[A-ZÀ-Ý][A-Za-zà-ÿ]*\b|\b\d+(?:[.,]\d+)?%|\b\d+(?:[.,]\d+)?\b/g;

function extractFirstWord(text: string): string | null {
  const match = text.trim().match(/^\S+/);
  if (!match) return null;
  return match[0].replace(/[^\w\u00C0-\u00FF]/g, "");
}

export function extractEntities(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const firstWord = extractFirstWord(trimmed);
  const matches = trimmed.match(ENTITY_PATTERN) ?? [];

  const seen = new Set<string>();
  const entities: string[] = [];

  matches.forEach((match, index) => {
    // Só a PRIMEIRA ocorrência é ignorada quando coincide com a primeira
    // palavra da frase (evita capturar verbos de abertura como entidade);
    // se a mesma palavra aparecer de novo depois, ela é uma entidade válida.
    if (index === 0 && match === firstWord) return;
    if (seen.has(match)) return;
    seen.add(match);
    entities.push(match);
  });

  return entities;
}
