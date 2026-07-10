import type { DiscoveryInput, DiscoverySourcePort, DiscoverySourceType } from "./discovery.types";

export const DISCOVERY_SOURCE_LABELS: Record<DiscoverySourceType, string> = {
  WEBSITE: "Website",
  GOOGLE_BUSINESS: "Google Business",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  MANUAL_INPUT: "Manual Input",
  FUTURE_API: "Future APIs",
};

export const ALL_DISCOVERY_SOURCES: readonly DiscoverySourceType[] = [
  "WEBSITE",
  "GOOGLE_BUSINESS",
  "INSTAGRAM",
  "FACEBOOK",
  "LINKEDIN",
  "MANUAL_INPUT",
  "FUTURE_API",
] as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createMockCollector(
  source: DiscoverySourceType,
  isAvailable: (input: DiscoveryInput) => boolean,
  buildPayload: (input: DiscoveryInput) => Record<string, unknown>,
): DiscoverySourcePort {
  return {
    source,
    isAvailable,
    collect: async (input) => {
      await delay(12);
      return {
        source,
        payload: buildPayload(input),
        collectedAt: new Date().toISOString(),
      };
    },
  };
}

export const manualInputSource: DiscoverySourcePort = createMockCollector(
  "MANUAL_INPUT",
  () => true,
  (input) => ({
    companyName: input.companyName,
    website: input.website ?? "",
    instagram: input.instagram ?? "",
    facebook: input.facebook ?? "",
    city: input.city ?? "",
  }),
);

export const websiteSource: DiscoverySourcePort = createMockCollector(
  "WEBSITE",
  (input) => Boolean(input.website?.trim()),
  (input) => ({
    url: input.website,
    title: input.companyName,
    description: `${input.companyName} — serviços profissionais em ${input.city ?? "mercado local"}.`,
    services: ["Impressão digital", "Comunicação visual", "Brindes corporativos"],
    products: ["Banners", "Adesivos", "Cartões de visita"],
  }),
);

export const googleBusinessSource: DiscoverySourcePort = createMockCollector(
  "GOOGLE_BUSINESS",
  () => true,
  (input) => ({
    name: input.companyName,
    rating: 4.6,
    reviews: 128,
    category: "Gráfica",
    address: input.city ? `${input.city}, Brasil` : "Endereço não informado",
    hours: "Seg–Sex 8h–18h",
  }),
);

export const instagramSource: DiscoverySourcePort = createMockCollector(
  "INSTAGRAM",
  (input) => Boolean(input.instagram?.trim()),
  (input) => ({
    handle: input.instagram,
    followers: 2400,
    posts: 186,
    bio: "Comunicação visual e impressão de qualidade",
  }),
);

export const facebookSource: DiscoverySourcePort = createMockCollector(
  "FACEBOOK",
  (input) => Boolean(input.facebook?.trim()),
  (input) => ({
    page: input.facebook,
    likes: 1800,
    checkIns: 320,
  }),
);

export const linkedInSource: DiscoverySourcePort = createMockCollector(
  "LINKEDIN",
  () => false,
  () => ({}),
);

export const futureApiSource: DiscoverySourcePort = createMockCollector(
  "FUTURE_API",
  () => false,
  () => ({}),
);

export function createDefaultDiscoverySources(): DiscoverySourcePort[] {
  return [
    manualInputSource,
    websiteSource,
    googleBusinessSource,
    instagramSource,
    facebookSource,
    linkedInSource,
    futureApiSource,
  ];
}

export async function collectFromSources(
  input: import("./discovery.types").ValidatedDiscoveryInput,
  sources: DiscoverySourcePort[],
): Promise<import("./discovery.types").RawSourceData[]> {
  const available = sources.filter((source) => source.isAvailable(input));
  return Promise.all(available.map((source) => source.collect(input)));
}
