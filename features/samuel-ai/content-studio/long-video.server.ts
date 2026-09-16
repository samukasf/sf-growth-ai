import { randomUUID } from "node:crypto";

import { createConfiguredResponsesProvider } from "@/apps/web/src/core/orchestrator/openai-responses.provider";

import type { SamuelContentProject, SocialPlatform } from "./samuel-content.types";
import { SOCIAL_PLATFORMS } from "./samuel-content.types";

const LONG_VIDEO_FORMAT = {
  type: "json_schema",
  name: "samuel_long_video",
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
        minItems: 6,
        maxItems: 18,
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

function clean(value: unknown, max = 20_000) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export type LongVideoRequest = {
  brief: string;
  durationTargetSeconds: number;
  aspectRatio: "9:16" | "1:1" | "16:9";
  platforms: SocialPlatform[];
  style: "documentary" | "educational" | "commercial" | "institutional";
};

export function validateLongVideoRequest(value: unknown): LongVideoRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Pedido inválido.");
  const data = value as Record<string, unknown>;
  const brief = clean(data.brief, 6_000);
  if (brief.length < 10) throw new Error("Descreva o tema e o objetivo do vídeo com mais detalhe.");
  const requestedDuration = Number(data.durationTargetSeconds);
  const durationTargetSeconds = Math.max(60, Math.min(600, Number.isFinite(requestedDuration) ? requestedDuration : 180));
  const aspectRatio: LongVideoRequest["aspectRatio"] = data.aspectRatio === "9:16" || data.aspectRatio === "1:1" ? data.aspectRatio : "16:9";
  const requested = Array.isArray(data.platforms) ? data.platforms : ["youtube", "facebook"];
  const platforms = SOCIAL_PLATFORMS.filter((platform) => requested.includes(platform));
  const style: LongVideoRequest["style"] = data.style === "educational" || data.style === "commercial" || data.style === "institutional" ? data.style : "documentary";
  return { brief, durationTargetSeconds, aspectRatio, platforms: platforms.length ? platforms : ["youtube"], style };
}

function wordTarget(seconds: number) {
  return Math.round(seconds * 2.25);
}

function buildPrompt(input: LongVideoRequest) {
  const minutes = Math.round((input.durationTargetSeconds / 60) * 10) / 10;
  return [
    `Crie um vídeo longo profissional em português brasileiro com aproximadamente ${minutes} minutos.`,
    `Estilo: ${input.style}. Formato: ${input.aspectRatio}.`,
    `Briefing: ${input.brief}`,
    `Roteiro falado alvo: aproximadamente ${wordTarget(input.durationTargetSeconds)} palavras, com abertura forte, desenvolvimento organizado e encerramento com CTA natural.`,
    "Divida em 6 a 18 cenas. Cada cena deve ter uma direção visual concreta, filmável ou representável por imagens de referência.",
    `Distribua as cenas para somar aproximadamente ${input.durationTargetSeconds} segundos.`,
    `Crie legenda/copy para: ${input.platforms.join(", ")}.`,
    "Não invente dados, resultados ou depoimentos. Entregue apenas o JSON solicitado.",
  ].join("\n");
}

function normalizeDurations(scenes: SamuelContentProject["scenes"], target: number) {
  const total = Math.max(1, scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0));
  return scenes.map((scene) => ({
    ...scene,
    durationSeconds: Math.max(8, Math.round((scene.durationSeconds / total) * target)),
  }));
}

function fallback(input: LongVideoRequest): SamuelContentProject {
  const chapterNames = [
    "Abertura e promessa central",
    "Contexto",
    "O problema",
    "Por que isso importa",
    "Como funciona",
    "Exemplo prático",
    "Pontos de atenção",
    "Plano de ação",
    "Resumo",
    "Próximo passo",
  ];
  const perScene = input.durationTargetSeconds / chapterNames.length;
  const scenes = chapterNames.map((headline, index) => ({
    headline,
    supportingText: index === 0 ? input.brief.slice(0, 240) : `Desenvolva este ponto de forma clara e objetiva: ${headline.toLowerCase()}.`,
    visualDirection: "Usar imagem de referência relacionada ao tema, movimento suave de câmera, enquadramento limpo e transição discreta.",
    durationSeconds: Math.max(8, Math.round(perScene)),
  }));
  const script = scenes.map((scene) => `${scene.headline}. ${scene.supportingText}`).join(" ");
  return {
    id: randomUUID(),
    format: "video",
    name: "Vídeo longo Samuel",
    objective: "Desenvolver o tema com profundidade e manter retenção até o final.",
    audience: "Público definido no briefing",
    hook: scenes[0].headline,
    script,
    callToAction: "Continue para o próximo passo indicado no vídeo.",
    aspectRatio: input.aspectRatio,
    scenes,
    socialCopies: input.platforms.map((platform) => ({ platform, caption: input.brief.slice(0, 500), hashtags: ["conteudo", "video", "negocios"] })),
    platforms: input.platforms,
    provider: "samuel-local-long-form",
    model: null,
    createdAt: new Date().toISOString(),
  };
}

function parseProject(content: string, input: LongVideoRequest, provider: string, model: string | null): SamuelContentProject {
  const raw = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não devolveu um roteiro longo válido.");
  const data = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  const scenes = Array.isArray(data.scenes) ? data.scenes.slice(0, 18).map((item) => {
    const scene = item as Record<string, unknown>;
    return {
      headline: clean(scene.headline, 120),
      supportingText: clean(scene.supportingText, 700),
      visualDirection: clean(scene.visualDirection, 500),
      durationSeconds: Math.max(8, Math.min(90, Number(scene.durationSeconds) || 20)),
    };
  }).filter((scene) => scene.headline && scene.supportingText) : [];
  if (scenes.length < 6) throw new Error("O vídeo longo precisa ter ao menos seis cenas.");
  const normalizedScenes = normalizeDurations(scenes, input.durationTargetSeconds);
  const socialCopies = Array.isArray(data.socialCopies) ? data.socialCopies.map((item) => {
    const copy = item as Record<string, unknown>;
    const platform = copy.platform as SocialPlatform;
    if (!input.platforms.includes(platform)) return null;
    return {
      platform,
      caption: clean(copy.caption, 2_200),
      hashtags: Array.isArray(copy.hashtags) ? copy.hashtags.map((tag) => clean(tag, 40).replace(/^#/, "")).filter(Boolean).slice(0, 12) : [],
    };
  }).filter((copy): copy is NonNullable<typeof copy> => Boolean(copy?.caption)) : [];

  return {
    id: randomUUID(),
    format: "video",
    name: clean(data.name, 100) || "Vídeo longo Samuel",
    objective: clean(data.objective, 500),
    audience: clean(data.audience, 500),
    hook: clean(data.hook, 240),
    script: clean(data.script, 20_000),
    callToAction: clean(data.callToAction, 500),
    aspectRatio: input.aspectRatio,
    scenes: normalizedScenes,
    socialCopies,
    platforms: input.platforms,
    provider,
    model,
    createdAt: new Date().toISOString(),
  };
}

export async function generateLongVideoProject(input: LongVideoRequest) {
  const provider = createConfiguredResponsesProvider({ maxOutputTokens: 9_000, reasoningEffort: "low", textFormat: LONG_VIDEO_FORMAT });
  if (!provider) return { project: fallback(input), source: "starter" as const, warning: "AI Gateway indisponível; foi criado um roteiro-base longo e totalmente editável." };
  try {
    const completion = await provider.complete({
      payload: {
        systemContext: "Você é um diretor, roteirista e editor de vídeos longos para YouTube e redes sociais. Priorize retenção, clareza e direção visual executável.",
        userQuery: buildPrompt(input),
        fragments: [],
        metadata: { intent: "creative-long-form", product: "samuel-content-studio" },
      },
    });
    return { project: parseProject(completion.content, input, completion.providerId, completion.model), source: "gateway" as const };
  } catch {
    return { project: fallback(input), source: "starter" as const, warning: "A IA não devolveu um roteiro longo válido; foi criado um roteiro-base editável." };
  }
}
