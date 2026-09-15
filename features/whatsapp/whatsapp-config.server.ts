import "server-only";

import { findWhatsAppBusinessConnection } from "./whatsapp-connection.repository";

export type WhatsAppCompanyConfig = {
  accessToken: string;
  phoneNumberId: string;
  graphApiVersion: string;
  businessAccountId?: string;
  businessId?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  webhookVerifyToken?: string;
  source: "database" | "environment";
};

type WhatsAppConfigMap = Record<string, Partial<Omit<WhatsAppCompanyConfig, "source">>>;

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeGraphVersion(value: string | undefined) {
  const cleanValue = clean(value) ?? "v26.0";
  return cleanValue.startsWith("v") ? cleanValue : `v${cleanValue}`;
}

function completeEnvConfig(
  value: Partial<Omit<WhatsAppCompanyConfig, "source">> | undefined,
): WhatsAppCompanyConfig | null {
  if (!value) return null;
  const accessToken = clean(value.accessToken);
  const phoneNumberId = clean(value.phoneNumberId);
  if (!accessToken || !phoneNumberId) return null;
  return {
    accessToken,
    phoneNumberId,
    graphApiVersion: normalizeGraphVersion(value.graphApiVersion),
    businessAccountId: clean(value.businessAccountId),
    businessId: clean(value.businessId),
    displayPhoneNumber: clean(value.displayPhoneNumber),
    verifiedName: clean(value.verifiedName),
    webhookVerifyToken: clean(value.webhookVerifyToken),
    source: "environment",
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

function resolveLegacyEnvConfig(companyId: string): WhatsAppCompanyConfig | null {
  const mapped = completeEnvConfig(readCompanyMap()[companyId]);
  if (mapped) return mapped;

  if (clean(process.env.WHATSAPP_OWNER_COMPANY_ID) !== companyId) return null;

  return completeEnvConfig({
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  });
}

export async function resolveWhatsAppConfig(
  companyId: string,
): Promise<WhatsAppCompanyConfig | null> {
  try {
    const connection = await findWhatsAppBusinessConnection(companyId);
    if (connection?.accessToken && connection.phoneNumberId) {
      return {
        accessToken: connection.accessToken,
        phoneNumberId: connection.phoneNumberId,
        graphApiVersion: normalizeGraphVersion(process.env.WHATSAPP_GRAPH_API_VERSION),
        businessAccountId: connection.wabaId,
        businessId: connection.metaBusinessId ?? undefined,
        displayPhoneNumber: connection.displayPhoneNumber ?? undefined,
        verifiedName: connection.verifiedName ?? undefined,
        webhookVerifyToken: clean(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
        source: "database",
      };
    }
  } catch {
    // Keep backward-compatible env support while DB onboarding is being rolled out.
  }

  return resolveLegacyEnvConfig(companyId);
}

export async function getWhatsAppConfigStatus(companyId: string) {
  const config = await resolveWhatsAppConfig(companyId);
  return {
    configured: Boolean(config),
    provider: "WhatsApp Business Platform",
    phoneNumberIdConfigured: Boolean(config?.phoneNumberId),
    businessAccountConfigured: Boolean(config?.businessAccountId),
    webhookConfigured: Boolean(config?.webhookVerifyToken),
    tenantScoped: true,
    source: config?.source ?? null,
    displayPhoneNumber: config?.displayPhoneNumber ?? null,
    verifiedName: config?.verifiedName ?? null,
  };
}
