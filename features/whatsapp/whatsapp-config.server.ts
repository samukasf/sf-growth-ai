import "server-only";

type WhatsAppCompanyConfig = {
  accessToken: string;
  phoneNumberId: string;
  graphApiVersion: string;
  businessAccountId?: string;
  webhookVerifyToken?: string;
};

type WhatsAppConfigMap = Record<string, Partial<WhatsAppCompanyConfig>>;

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function completeConfig(value: Partial<WhatsAppCompanyConfig> | undefined): WhatsAppCompanyConfig | null {
  if (!value) return null;
  const accessToken = clean(value.accessToken);
  const phoneNumberId = clean(value.phoneNumberId);
  const graphApiVersion = clean(value.graphApiVersion);
  if (!accessToken || !phoneNumberId || !graphApiVersion) return null;
  return {
    accessToken,
    phoneNumberId,
    graphApiVersion,
    businessAccountId: clean(value.businessAccountId),
    webhookVerifyToken: clean(value.webhookVerifyToken),
  };
}

function readCompanyMap(): WhatsAppConfigMap {
  const raw = process.env.WHATSAPP_COMPANY_CONFIG_JSON;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as WhatsAppConfigMap;
  } catch {
    return {};
  }
}

export function resolveWhatsAppConfig(companyId: string): WhatsAppCompanyConfig | null {
  const mapped = completeConfig(readCompanyMap()[companyId]);
  if (mapped) return mapped;

  // Backward-compatible single-account configuration is deliberately locked
  // to one explicit company. Without an owner id, global credentials are not
  // exposed to any tenant.
  if (clean(process.env.WHATSAPP_OWNER_COMPANY_ID) !== companyId) return null;

  return completeConfig({
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  });
}

export function getWhatsAppConfigStatus(companyId: string) {
  const config = resolveWhatsAppConfig(companyId);
  return {
    configured: Boolean(config),
    provider: "WhatsApp Business Platform",
    phoneNumberIdConfigured: Boolean(config?.phoneNumberId),
    businessAccountConfigured: Boolean(config?.businessAccountId),
    webhookConfigured: Boolean(config?.webhookVerifyToken),
    tenantScoped: true,
  };
}
