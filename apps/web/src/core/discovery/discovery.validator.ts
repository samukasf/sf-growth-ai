import {
  DEMO_COMPANY_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
} from "../superbrain/superbrain.mocks";
import type { DiscoveryInput, ValidatedDiscoveryInput } from "./discovery.types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  validated?: ValidatedDiscoveryInput;
}

function normalizeWebsite(value?: string): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function normalizeSocialHandle(value?: string): string {
  if (!value?.trim()) return "";
  return value.trim().replace(/^@/, "");
}

export function validateDiscoveryInput(input: DiscoveryInput): ValidationResult {
  const errors: string[] = [];

  if (!input.companyName?.trim()) {
    errors.push("Nome da empresa é obrigatório.");
  }

  if (input.website?.trim()) {
    try {
      new URL(normalizeWebsite(input.website));
    } catch {
      errors.push("Website inválido.");
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    validated: {
      ...input,
      companyName: input.companyName.trim(),
      tenantId: input.tenantId ?? DEMO_TENANT_ID,
      companyId: input.companyId ?? DEMO_COMPANY_ID,
      userId: input.userId ?? DEMO_USER_ID,
      normalizedWebsite: normalizeWebsite(input.website),
      normalizedCity: input.city?.trim() ?? "",
      instagram: normalizeSocialHandle(input.instagram),
      facebook: normalizeSocialHandle(input.facebook),
    },
  };
}

export function detectMissingInformation(
  input: ValidatedDiscoveryInput,
  extracted: { competitors: string[]; linkedin?: string },
): string[] {
  const missing: string[] = [];

  if (!input.normalizedWebsite) missing.push("Website oficial");
  if (!input.instagram) missing.push("Instagram");
  if (!input.facebook) missing.push("Facebook");
  if (!input.normalizedCity) missing.push("Cidade / localização");
  if (extracted.competitors.length === 0) missing.push("Lista de concorrentes");
  if (!extracted.linkedin) missing.push("LinkedIn");

  return missing;
}
