import type {
  ClassifiedDiscoveryData,
  DiscoverySwotItem,
  ExtractedDiscoveryData,
  RawSourceData,
  ValidatedDiscoveryInput,
} from "./discovery.types";
import { detectMissingInformation } from "./discovery.validator";

function swot(id: string, title: string, description: string): DiscoverySwotItem {
  return { id, title, description };
}

export function extractInformation(
  input: ValidatedDiscoveryInput,
  rawSources: RawSourceData[],
): ExtractedDiscoveryData {
  const manual = rawSources.find((s) => s.source === "MANUAL_INPUT")?.payload ?? {};
  const website = rawSources.find((s) => s.source === "WEBSITE")?.payload ?? {};
  const google = rawSources.find((s) => s.source === "GOOGLE_BUSINESS")?.payload ?? {};

  const services = (website.services as string[] | undefined) ?? [
    "Impressão digital",
    "Comunicação visual",
  ];
  const products = (website.products as string[] | undefined) ?? ["Banners", "Adesivos"];

  return {
    company: input.companyName,
    website: input.normalizedWebsite || String(manual.website ?? ""),
    industry: String(google.category ?? "Gráfica e comunicação visual"),
    services,
    products,
    location: input.normalizedCity || String(google.address ?? "Não informado"),
    socialNetworks: {
      instagram: input.instagram || undefined,
      facebook: input.facebook || undefined,
    },
    competitors: ["PrintMax Local", "VisualCorp", "Gráfica Rápida"],
    sourcesUsed: rawSources.map((s) => s.source),
  };
}

export function classifyDiscoveryData(
  input: ValidatedDiscoveryInput,
  extracted: ExtractedDiscoveryData,
): ClassifiedDiscoveryData {
  const missingInformation = detectMissingInformation(input, {
    competitors: extracted.competitors,
    linkedin: extracted.socialNetworks.linkedin,
  });

  let confidence = 55;
  if (extracted.website) confidence += 15;
  if (extracted.socialNetworks.instagram) confidence += 10;
  if (extracted.socialNetworks.facebook) confidence += 8;
  if (extracted.location !== "Não informado") confidence += 7;
  confidence -= missingInformation.length * 3;
  confidence = Math.max(30, Math.min(95, confidence));

  return {
    ...extracted,
    strengths: [
      swot("s1", "Marca consistente", "Identidade visual reconhecida regionalmente."),
      swot("s2", "Avaliações positivas", "Google Business com boa reputação."),
      swot("s3", "Portfólio diversificado", "Mix de serviços gráficos e comunicação visual."),
    ],
    weaknesses: [
      swot("w1", "Pouca presença em SEO", "Site com baixa otimização para busca orgânica."),
      swot("w2", "Redes sociais irregulares", "Frequência de postagens abaixo do benchmark."),
    ],
    opportunities: [
      swot("o1", "Campanhas Google", "Capturar demanda local via Google Ads."),
      swot("o2", "Landing Pages", "Páginas dedicadas por linha de serviço."),
      swot("o3", "Conteúdo Instagram", "Mostrar bastidores e cases de clientes."),
    ],
    risks: [
      swot("r1", "Dependência de indicação", "Canal principal ainda é boca a boca."),
      swot("r2", "Concorrentes digitalizando", "Players locais investindo em marketing."),
    ],
    confidence,
    missingInformation,
  };
}

export function buildExecutiveSummary(data: ClassifiedDiscoveryData): string {
  return [
    `${data.company} atua em ${data.industry} em ${data.location}.`,
    `Oferece ${data.services.slice(0, 2).join(" e ")}.`,
    `Confiança do discovery: ${data.confidence}%.`,
    data.missingInformation.length > 0
      ? `Informações pendentes: ${data.missingInformation.join(", ")}.`
      : "Perfil completo para alimentar o Company Brain.",
  ].join(" ");
}

export function buildNextSteps(data: ClassifiedDiscoveryData): string[] {
  const steps = [
    "Revisar dados descobertos no Company Brain.",
    "Completar informações ausentes manualmente.",
    "Executar análise executiva via Company Analysis.",
  ];
  if (data.weaknesses.some((w) => w.title.includes("SEO"))) {
    steps.push("Priorizar plano de SEO técnico.");
  }
  return steps;
}
