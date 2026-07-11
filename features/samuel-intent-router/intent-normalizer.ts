/**
 * Normalização de texto de entrada — idioma-agnóstica.
 *
 * Faz apenas transformações genéricas (minúsculas, remoção de acentos via
 * Unicode NFD, colapso de espaços). Não remove nem interpreta palavras de
 * nenhum idioma específico — isso é responsabilidade das regras em
 * `languages/*`.
 */
export function normalizeIntentQuery(query: string): string {
  return query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
