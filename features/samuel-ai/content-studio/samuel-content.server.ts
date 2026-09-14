import { randomUUID } from "node:crypto";

import { createConfiguredResponsesProvider } from "@/apps/web/src/core/orchestrator/openai-responses.provider";

import type {
  ContentFormat,
  SamuelContentProject,
  SocialPlatform,
} from "./samuel-content.types";
import { SOCIAL_PLATFORMS } from "./samuel-content.types";

export const SAMUEL_CONTENT_TEXT_FORMAT = {
  type: "json_schema",
  name: "samuel_social_content",
  strict: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      objective: { type: "string" },
      audience: { type: "string" },
      hook: { type: "string" },
      script: { type: "string" },
      callToAction: { type: "string" },
      scenes: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: {
          type: "object",
          properties: {
            headline: { type: "string" },
            supportingText: { type: "string" },
            visualDirection: { type: "string" },
            durationSeconds: { type: "number" },
          },
          required: ["headline", "supportingText", "visualDirection", "durationSeconds"],
          additionalProperties: false,
        },
      },
      socialCopies: {
        type: "array",
        minItems: 1,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            platform: { type: "string", enum: [...SOCIAL_PLATFORMS] },
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" }, maxItems: 12 },
          },
          required: ["platform", "caption", "hashtags"],
          additionalProperties: false,
        },
      },
    },
    required: ["name", "objective", "audience", "hook", "script", "callToAction", "scenes", "socialCopies"],
    additionalProperties: false,
  },
} as const;

function clean(value: unknown, max = 4_000) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function validateContentRequest(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Pedido inválido.");
  const data = value as Record<string, unknown>;
  const brief = clean(data.brief, 4_000);
  if (brief.length < 10) throw new Error("Descreva o produto ou a campanha com mais detalhe.");
  const format: ContentFormat = data.format === "post" ? "post" : "video";
  const aspectRatio: "9:16" | "1:1" | "16:9" =
    data.aspectRatio === "1:1" || data.aspectRatio === "16:9" ? data.aspectRatio : "9:16";
  const requested = Array.isArray(data.platforms) ? data.platforms : SOCIAL_PLATFORMS;
  const platforms = SOCIAL_PLATFORMS.filter((platform) => requested.includes(platform));
  if (!platforms.length) throw new Error("Escolha ao menos uma rede social.");
  return { brief, format, aspectRatio, platforms };
}

export function buildContentPrompt(input: ReturnType<typeof validateContentRequest>) {
  return [
    `Crie uma campanha de ${input.format === "video" ? "vídeo curto" : "postagem"} em português brasileiro.`,
    `Briefing: ${input.brief}`,
    `Redes: ${input.platforms.join(", ")}. Formato visual: ${input.aspectRatio}.`,
    "O roteiro deve soar humano, objetivo e persuasivo, sem promessas não comprovadas.",
    "Crie entre 3 e 6 cenas. A soma das durações deve ficar entre 20 e 60 segundos.",
    "Adapte uma legenda para cada rede solicitada e inclua hashtags sem o símbolo #.",
    "Entregue apenas o JSON solicitado.",
  ].join("\n");
}

function fallbackProject(input: ReturnType<typeof validateContentRequest>): SamuelContentProject {
  const subject = input.brief.slice(0, 90);
  const scenes = [
    { headline: "Pare de perder oportunidades", supportingText: subject, visualDirection: "Entrada com luz azul e movimento suave", durationSeconds: 6 },
    { headline: "Uma solução feita para você", supportingText: "Mais clareza, velocidade e resultado no dia a dia.", visualDirection: "Produto em destaque com elementos tecnológicos", durationSeconds: 8 },
    { headline: "Transforme sua rotina", supportingText: "Veja como colocar essa ideia em prática agora.", visualDirection: "Benefícios surgindo em sequência", durationSeconds: 8 },
    { headline: "Dê o próximo passo", supportingText: "Fale com a nossa equipe e saiba mais.", visualDirection: "Logo e chamada para ação", durationSeconds: 6 },
  ];
  const script = scenes.map((scene) => `${scene.headline}. ${scene.supportingText}`).join(" ");
  return {
    id: randomUUID(), format: input.format, name: "Campanha Samuel", objective: "Apresentar a oferta e gerar interesse",
    audience: "Público interessado na solução", hook: scenes[0].headline, script, callToAction: "Fale com a nossa equipe e saiba mais.",
    aspectRatio: input.aspectRatio, scenes,
    socialCopies: input.platforms.map((platform) => ({ platform, caption: `${scenes[0].headline}. ${scenes[1].supportingText} ${scenes[3].supportingText}`, hashtags: ["inovacao", "resultados", "negocios"] })),
    platforms: input.platforms, provider: "samuel-local", model: null, createdAt: new Date().toISOString(),
  };
}

export function createFallbackContentProject(input: ReturnType<typeof validateContentRequest>) {
  return fallbackProject(input);
}

export function parseContentProject(content: string, input: ReturnType<typeof validateContentRequest>, provider: string, model: string | null): SamuelContentProject {
  const raw = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não devolveu uma campanha válida.");
  const data = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  const scenes = Array.isArray(data.scenes) ? data.scenes.slice(0, 8).map((item) => {
    const scene = item as Record<string, unknown>;
    return {
      headline: clean(scene.headline, 90), supportingText: clean(scene.supportingText, 240), visualDirection: clean(scene.visualDirection, 240),
      durationSeconds: Math.max(3, Math.min(15, Number(scene.durationSeconds) || 6)),
    };
  }).filter((scene) => scene.headline && scene.supportingText) : [];
  if (scenes.length < 3) throw new Error("A campanha precisa ter pelo menos três cenas.");
  const socialCopies = Array.isArray(data.socialCopies) ? data.socialCopies.map((item) => {
    const copy = item as Record<string, unknown>;
    const platform = copy.platform as SocialPlatform;
    if (!input.platforms.includes(platform)) return null;
    return { platform, caption: clean(copy.caption, 2_200), hashtags: Array.isArray(copy.hashtags) ? copy.hashtags.map((tag) => clean(tag, 40).replace(/^#/, "")).filter(Boolean).slice(0, 12) : [] };
  }).filter((copy): copy is NonNullable<typeof copy> => Boolean(copy?.caption)) : [];
  return {
    id: randomUUID(), format: input.format, name: clean(data.name, 80) || "Campanha Samuel", objective: clean(data.objective, 240),
    audience: clean(data.audience, 240), hook: clean(data.hook, 180), script: clean(data.script, 5_000), callToAction: clean(data.callToAction, 240),
    aspectRatio: input.aspectRatio, scenes, socialCopies, platforms: input.platforms, provider, model, createdAt: new Date().toISOString(),
  };
}

export function isContentCreationRequest(query: string) {
  const normalized = query.toLocaleLowerCase("pt-BR");
  const creation = /\b(crie|cria|criar|faça|fazer|gere|gerar|produza|produzir|monte|montar)\b/i.test(normalized);
  const content = /\b(vídeo|video|reel|short|post|postagem|conteúdo|conteudo|campanha)\b/i.test(normalized);
  return creation && content;
}

export function contentRequestFromQuery(query: string) {
  const normalized = query.toLocaleLowerCase("pt-BR");
  const explicit = SOCIAL_PLATFORMS.filter((platform) => {
    if (platform === "facebook") return /\bfacebook|\bface\b/.test(normalized);
    if (platform === "instagram") return /\binstagram|\binsta\b|\breels?\b/.test(normalized);
    if (platform === "youtube") return /\byoutube|\bshorts?\b/.test(normalized);
    if (platform === "tiktok") return /\btik\s?tok\b/.test(normalized);
    return /\blinked\s?in\b/.test(normalized);
  });
  return validateContentRequest({
    brief: query,
    format: /\b(post|postagem|carrossel)\b/.test(normalized) && !/\b(vídeo|video|reel|short)\b/.test(normalized) ? "post" : "video",
    aspectRatio: /\byoutube\b/.test(normalized) && !/\bshorts?\b/.test(normalized) ? "16:9" : "9:16",
    platforms: explicit.length ? explicit : SOCIAL_PLATFORMS,
  });
}

export async function generateContentProject(input: ReturnType<typeof validateContentRequest>) {
  const provider = createConfiguredResponsesProvider({ maxOutputTokens: 4_500, reasoningEffort: "low", textFormat: SAMUEL_CONTENT_TEXT_FORMAT });
  if (!provider) return { project: createFallbackContentProject(input), source: "starter" as const, warning: "AI Gateway indisponível; foi criada uma campanha-base editável." };
  try {
    const completion = await provider.complete({ payload: { systemContext: "Você é um estrategista e roteirista de conteúdo para redes sociais do Samuel IA.", userQuery: buildContentPrompt(input), fragments: [], metadata: { intent: "creative", product: "samuel-content-studio" } } });
    return { project: parseContentProject(completion.content, input, completion.providerId, completion.model), source: "gateway" as const };
  } catch {
    return { project: createFallbackContentProject(input), source: "starter" as const, warning: "A IA não devolveu um plano válido; o Samuel preservou o pedido em uma campanha-base." };
  }
}
