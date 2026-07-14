/**
 * Monta o prompt de contexto de ferramenta enviado ao AI Gateway.
 * O núcleo do Gateway (`@/core/ai-provider`) não é alterado — apenas o
 * prompt executivo do adapter do runtime recebe este bloco adicional.
 */
export function buildToolInterpretationPrompt(facts: string, userQuery: string): string {
  return [
    "Resultado de ferramenta executada pelo Samuel:",
    "",
    facts,
    "",
    `Pergunta original do usuário: ${userQuery}`,
    "",
    "Utilize essas informações para responder naturalmente ao usuário em português.",
    "Nunca cite JSON, IDs técnicos de API ou estruturas brutas — traduza tudo para linguagem clara e consultiva.",
    "Conecte o resultado da ferramenta à pergunta do usuário e ofereça próximos passos quando fizer sentido.",
  ].join("\n");
}
