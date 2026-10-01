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
  /\b(pesquis(?:a|e|ar|ando)?|procure|buscar?|busque|encontre|localize|internet|web|online|tempo real|em tempo real|atualizad[oa]s?|agora|hoje|amanh[aã]|ontem|recentes?|[uú]ltim[oa]s?|previs[aã]o|meteorolog(?:ia|ic[oa])?|clima|not[ií]cias?|pre[cç]os?|valor atual|cota[cç][aã]o|d[oó]lar|euro|bolsa|tr[aâ]nsito|tr[aá]fego|hor[aá]rios?|aberto agora|resultados?|placar|lan[cç]amentos?|disponibilidade)\b/i;

const WEATHER_PATTERN =
  /\b(previs[aã]o|meteorolog(?:ia|ic[oa])?|clima|temperatura|chuva|chover|vento|tempo hoje|tempo amanh[aã])\b/i;

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

type SearchContext = {
  query: string;
  locationHint?: string | null;
  signal?: AbortSignal;
  env: NodeJS.ProcessEnv;
  fetcher: typeof fetch;
};

export function shouldUseSamuelLiveWeb(query: string) {
  return LIVE_WEB_PATTERN.test(query.normalize("NFC"));
}

function isWeatherQuery(query: string) {
  return WEATHER_PATTERN.test(query.normalize("NFC"));
}

function sourceTitle(url: string, title?: string) {
  const cleanTitle = title?.trim();
  if (cleanTitle) return cleanTitle;
  try {
    return new URL(url).hostname;
  } catch {
    return "Fonte web";
  }
}

function cleanText(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function collectSources(payload: WebResponse) {
  const candidates: SamuelWebSource[] = [];

  for (const item of payload.output ?? []) {
    for (const source of item.action?.sources ?? []) {
      if (source.url) {
        candidates.push({
          url: source.url,
          title: sourceTitle(source.url, source.title),
        });
      }
    }
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          candidates.push({
            url: annotation.url,
            title: sourceTitle(annotation.url, annotation.title),
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

function explicitWeatherLocation(query: string) {
  const normalized = query
    .replace(/[?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(
    /\b(?:em|para|na|no)\s+([\p{L}][\p{L}\s'’-]{1,70}?)(?=\s+(?:hoje|amanh[aã]|agora|nesta|nesse|este|essa|com|e\s)|$)/iu,
  );
  return match?.[1]?.trim() || null;
}

function weatherCodeLabel(code: number) {
  if (code === 0) return "céu limpo";
  if ([1, 2, 3].includes(code)) return "parcialmente nublado";
  if ([45, 48].includes(code)) return "nevoeiro";
  if ([51, 53, 55, 56, 57].includes(code)) return "chuvisco";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "chuva";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "neve";
  if ([95, 96, 99].includes(code)) return "trovoada";
  return `condição meteorológica código ${code}`;
}

async function searchWeather(context: SearchContext): Promise<SamuelLiveWebResult | null> {
  const location =
    explicitWeatherLocation(context.query) ||
    context.locationHint?.trim() ||
    null;
  if (!location) return null;

  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.searchParams.set("name", location);
  geocodeUrl.searchParams.set("count", "1");
  geocodeUrl.searchParams.set("language", "pt");
  geocodeUrl.searchParams.set("format", "json");

  const geocodeResponse = await context.fetcher(geocodeUrl, {
    cache: "no-store",
    signal: context.signal,
  });
  if (!geocodeResponse.ok) {
    throw new Error(`Open-Meteo geocoding HTTP ${geocodeResponse.status}`);
  }

  const geocode = (await geocodeResponse.json()) as {
    results?: Array<{
      name?: string;
      country?: string;
      admin1?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    }>;
  };
  const place = geocode.results?.[0];
  if (
    !place ||
    typeof place.latitude !== "number" ||
    typeof place.longitude !== "number"
  ) {
    throw new Error(`Não encontrei a localização "${location}" para consultar a previsão.`);
  }

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(place.latitude));
  forecastUrl.searchParams.set("longitude", String(place.longitude));
  forecastUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m",
  );
  forecastUrl.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("forecast_days", "3");

  const forecastResponse = await context.fetcher(forecastUrl, {
    cache: "no-store",
    signal: context.signal,
  });
  if (!forecastResponse.ok) {
    throw new Error(`Open-Meteo forecast HTTP ${forecastResponse.status}`);
  }

  const forecast = (await forecastResponse.json()) as {
    current?: {
      temperature_2m?: number;
      apparent_temperature?: number;
      precipitation?: number;
      rain?: number;
      weather_code?: number;
      wind_speed_10m?: number;
    };
    daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
    };
  };

  const current = forecast.current ?? {};
  const daily = forecast.daily ?? {};
  const placeName = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  const currentCode = Number(current.weather_code ?? -1);
  const todayMax = daily.temperature_2m_max?.[0];
  const todayMin = daily.temperature_2m_min?.[0];
  const rainChance = daily.precipitation_probability_max?.[0];

  const currentParts = [
    `Tempo agora em ${placeName}: ${Number(current.temperature_2m ?? 0).toFixed(1)} °C`,
    typeof current.apparent_temperature === "number"
      ? `sensação de ${current.apparent_temperature.toFixed(1)} °C`
      : "",
    currentCode >= 0 ? weatherCodeLabel(currentCode) : "",
    typeof current.wind_speed_10m === "number"
      ? `vento de ${current.wind_speed_10m.toFixed(0)} km/h`
      : "",
  ].filter(Boolean);

  const todayParts = [
    typeof todayMin === "number" && typeof todayMax === "number"
      ? `Hoje: mínima de ${todayMin.toFixed(0)} °C e máxima de ${todayMax.toFixed(0)} °C`
      : "",
    typeof rainChance === "number"
      ? `probabilidade máxima de precipitação de ${rainChance.toFixed(0)}%`
      : "",
  ].filter(Boolean);

  const nextDays = (daily.time ?? [])
    .slice(1, 3)
    .map((date, index) => {
      const i = index + 1;
      const min = daily.temperature_2m_min?.[i];
      const max = daily.temperature_2m_max?.[i];
      const probability = daily.precipitation_probability_max?.[i];
      const code = Number(daily.weather_code?.[i] ?? -1);
      return [
        date,
        code >= 0 ? weatherCodeLabel(code) : "",
        typeof min === "number" && typeof max === "number"
          ? `${min.toFixed(0)}–${max.toFixed(0)} °C`
          : "",
        typeof probability === "number" ? `chuva até ${probability.toFixed(0)}%` : "",
      ]
        .filter(Boolean)
        .join(", ");
    })
    .filter(Boolean);

  return {
    summary: [
      currentParts.join(", ") + ".",
      todayParts.length ? todayParts.join(", ") + "." : "",
      nextDays.length ? `Próximos dias: ${nextDays.join(" | ")}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    sources: [
      {
        title: "Open-Meteo · previsão em tempo real",
        url: forecastUrl.toString(),
      },
    ],
    model: "open-meteo",
  };
}

async function searchTavily(context: SearchContext): Promise<SamuelLiveWebResult | null> {
  const apiKey = context.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await context.fetcher("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: context.query,
      topic: /\bnot[ií]cia|recent|hoje|agora\b/i.test(context.query) ? "news" : "general",
      search_depth: "basic",
      max_results: 6,
      include_answer: true,
    }),
    cache: "no-store",
    signal: context.signal,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    answer?: string;
    results?: Array<{ title?: string; url?: string; content?: string }>;
  };
  if (!response.ok) throw new Error(`Tavily HTTP ${response.status}`);

  const sources = (payload.results ?? [])
    .filter((result) => result.url)
    .map((result) => ({
      title: result.title?.trim() || sourceTitle(result.url ?? ""),
      url: result.url!,
    }))
    .slice(0, 8);
  const summary =
    payload.answer?.trim() ||
    (payload.results ?? [])
      .slice(0, 6)
      .map((result) =>
        [result.title?.trim(), result.content?.trim()].filter(Boolean).join(": "),
      )
      .filter(Boolean)
      .join("\n");

  return summary ? { summary, sources, model: "tavily" } : null;
}

async function searchBrave(context: SearchContext): Promise<SamuelLiveWebResult | null> {
  const apiKey = context.env.BRAVE_SEARCH_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", context.query);
  url.searchParams.set("count", "8");
  url.searchParams.set("search_lang", "pt");

  const response = await context.fetcher(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
    cache: "no-store",
    signal: context.signal,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
  };
  if (!response.ok) throw new Error(`Brave Search HTTP ${response.status}`);

  const results = payload.web?.results ?? [];
  const sources = results
    .filter((result) => result.url)
    .map((result) => ({
      title: result.title?.trim() || sourceTitle(result.url ?? ""),
      url: result.url!,
    }))
    .slice(0, 8);
  const summary = results
    .slice(0, 6)
    .map((result) =>
      [result.title?.trim(), result.description?.trim()].filter(Boolean).join(": "),
    )
    .filter(Boolean)
    .join("\n");

  return summary ? { summary, sources, model: "brave-search" } : null;
}

function rssTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ? cleanText(match[1]) : "";
}

async function searchBingRss(context: SearchContext): Promise<SamuelLiveWebResult | null> {
  const url = new URL("https://www.bing.com/search");
  url.searchParams.set("q", context.query);
  url.searchParams.set("format", "rss");
  url.searchParams.set("setlang", "pt-BR");

  const response = await context.fetcher(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
      "User-Agent": "Mozilla/5.0 (compatible; SamuelAI/1.0; +https://sf-growth-ai.vercel.app)",
    },
    cache: "no-store",
    signal: context.signal,
  });
  if (!response.ok) throw new Error(`Bing RSS HTTP ${response.status}`);
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => match[1])
    .slice(0, 8)
    .map((item) => ({
      title: rssTag(item, "title"),
      url: rssTag(item, "link"),
      description: rssTag(item, "description"),
    }))
    .filter((item) => /^https?:\/\//i.test(item.url));

  if (!items.length) return null;
  const sources = items.map((item) => ({
    title: item.title || sourceTitle(item.url),
    url: item.url,
  }));
  const summary = items
    .slice(0, 6)
    .map((item) =>
      [item.title, item.description].filter(Boolean).join(": "),
    )
    .filter(Boolean)
    .join("\n");

  return summary ? { summary, sources, model: "bing-rss" } : null;
}

async function searchOpenAi(context: SearchContext): Promise<SamuelLiveWebResult | null> {
  const apiKey = context.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  const model = context.env.SAMUEL_WEB_SEARCH_MODEL?.trim() || "gpt-5.4-mini";
  const locationHint = context.locationHint?.trim();
  const instructions = [
    "Você é a camada de pesquisa web em tempo real do Samuel AI.",
    "Pesquise a internet ao vivo antes de responder.",
    "Extraia apenas fatos atuais necessários para responder à pergunta.",
    "Não invente números, horários, preços, notícias ou disponibilidade.",
    "Responda em português brasileiro de forma factual e concisa.",
  ].join("\n");

  const response = await context.fetcher("https://api.openai.com/v1/responses", {
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
        `Pergunta do utilizador: ${context.query}`,
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
    signal: context.signal,
  });

  const payload = (await response.json().catch(() => ({}))) as WebResponse;
  if (!response.ok) {
    throw new Error(
      payload.error?.message || `OpenAI web search HTTP ${response.status}`,
    );
  }
  const summary = extractText(payload);
  return summary
    ? { summary, sources: collectSources(payload), model }
    : null;
}

export async function searchSamuelLiveWeb(input: {
  query: string;
  locationHint?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}): Promise<SamuelLiveWebResult | null> {
  if (!shouldUseSamuelLiveWeb(input.query)) return null;

  const context: SearchContext = {
    query: input.query,
    locationHint: input.locationHint,
    signal: input.signal,
    fetcher: input.fetcher ?? fetch,
    env: input.env ?? process.env,
  };
  const failures: string[] = [];

  if (isWeatherQuery(input.query)) {
    try {
      const weather = await searchWeather(context);
      if (weather) {
        console.info("Samuel live web search completed", {
          provider: weather.model,
          sources: weather.sources.length,
        });
        return weather;
      }
    } catch (error) {
      failures.push(`open-meteo: ${error instanceof Error ? error.message : "falha"}`);
    }
  }

  const providers = [
    ["tavily", searchTavily],
    ["brave", searchBrave],
    ["bing-rss", searchBingRss],
    ["openai", searchOpenAi],
  ] as const;

  for (const [provider, search] of providers) {
    try {
      const result = await search(context);
      if (!result) continue;
      console.info("Samuel live web search completed", {
        provider: result.model,
        sources: result.sources.length,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "falha desconhecida";
      failures.push(`${provider}: ${message}`);
      console.warn("Samuel live web provider failed", {
        provider,
        message: message.slice(0, 280),
      });
    }
  }

  throw new Error(
    failures.length
      ? `Nenhum provedor de pesquisa web respondeu. ${failures.join(" | ")}`
      : "Nenhum provedor de pesquisa web respondeu.",
  );
}
