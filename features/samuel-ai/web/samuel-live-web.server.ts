export type SamuelWebSource = {
  title: string;
  url: string;
};

export type SamuelLiveWebResult = {
  summary: string;
  sources: SamuelWebSource[];
  model: string;
};

const LIVE_WEB_PATTERN =
  /\b(pesquis|procure|buscar?|busque|encontre|localize|internet|web|online|tempo real|em tempo real|atualizad|agora|hoje|amanh[aã]|ontem|recente|[uú]ltim|previs[aã]o|meteorolog|clima|not[ií]cia|pre[cç]o|valor atual|cota[cç][aã]o|d[oó]lar|euro|bolsa|tr[aâ]nsito|tr[aá]fego|hor[aá]rio|aberto agora|resultado|placar|lan[cç]amento|disponibilidade)\b/i;

export function shouldUseSamuelLiveWeb(query: string) {
  return LIVE_WEB_PATTERN.test(query.normalize("NFC"));
}

type WebAnnotation = {
  type?: string;
  url?: string;
  title?: string;
};

type WebSearchSource = {
  url?: string;
  title?: string;
};

type WebResponse = {
  error?: { message?: string };
  output?: Array<{
    type?: string;
    action?: { sources?: WebSearchSource[] };
    content?: Array<{
      type?: string;
      text?: string;
      annotations?: WebAnnotation[];
    }>;
  }>;
};

function collectSources(payload: WebResponse) {
  const candidates: SamuelWebSource[] = [];

  for (const item of payload.output ?? []) {
    for (const source of item.action?.sources ?? []) {
      if (source.url) {
        candidates.push({
          url: source.url,
          title: source.title?.trim() || new URL(source.url).hostname,
        });
      }
    }
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          candidates.push({
            url: annotation.url,
            title: annotation.title?.trim() || new URL(annotation.url).hostname,
          });
        }
      }
    }
  }

  return [...new Map(candidates.map((source) => [source.url, source])).values()].slice(0, 8);
}

function extractText(payload: WebResponse) {
  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function searchSamuelLiveWeb(input: {
  query: string;
  locationHint?: string | null;
  signal?: AbortSignal;
}): Promise<SamuelLiveWebResult | null> {
  if (!shouldUseSamuelLiveWeb(input.query)) return null;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada para pesquisa web ao vivo.");
  }

  const model = process.env.SAMUEL_WEB_SEARCH_MODEL?.trim() || "gpt-5.4-mini";
  const locationHint = input.locationHint?.trim();
  const instructions = [
    "Você é a camada de pesquisa web em tempo real do Samuel AI.",
    "Pesquise a internet ao vivo antes de responder.",
    "Extraia apenas fatos atuais necessários para responder à pergunta.",
    "Não invente números, horários, previsão meteorológica, preços, notícias ou disponibilidade.",
    "Se a pergunta depender de uma cidade/local e nenhum local estiver claro, diga no resumo que o assistente deve pedir a cidade.",
    "Responda em português brasileiro de forma factual e concisa.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input: [
        `Data atual do servidor: ${new Date().toISOString()}.`,
        locationHint ? `Localização contextual da empresa: ${locationHint}.` : "",
        `Pergunta do utilizador: ${input.query}`,
      ]
        .filter(Boolean)
        .join("\n"),
      tools: [
        {
          type: "web_search",
          search_context_size: "medium",
          external_web_access: true,
        },
      ],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
      max_output_tokens: 1400,
      store: false,
    }),
    cache: "no-store",
    signal: input.signal,
  });

  const payload = (await response.json().catch(() => ({}))) as WebResponse;
  if (!response.ok) {
    throw new Error(
      payload.error?.message || `Pesquisa web respondeu HTTP ${response.status}.`,
    );
  }

  const summary = extractText(payload);
  if (!summary) throw new Error("Pesquisa web concluiu sem resumo.");

  return {
    summary,
    sources: collectSources(payload),
    model,
  };
}
