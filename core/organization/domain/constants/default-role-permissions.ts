import type { AccessLevel, PermissionScope } from "../entities";

export const DEFAULT_ROLE_PERMISSIONS: Record<AccessLevel, PermissionScope[]> = {
  owner: ["finance", "marketing", "hr", "legal", "operations", "crm", "projects", "purchasing", "sales", "settings", "integrations"],
  partner: ["finance", "marketing", "hr", "legal", "operations", "crm", "projects", "purchasing", "sales", "settings", "integrations"],
  ceo: ["finance", "marketing", "hr", "legal", "operations", "crm", "projects", "purchasing", "sales", "settings", "integrations"],
  director: ["finance", "marketing", "operations", "crm", "projects", "sales"],
  manager: ["operations", "crm", "projects", "sales"],
  coordinator: ["operations", "crm", "projects"],
  supervisor: ["operations", "crm"],
  employee: ["crm"],
  external_consultant: ["projects"],
  accountant: ["finance"],
  lawyer: ["legal"],
  developer: ["projects", "integrations", "settings"],
  auditor: ["finance", "operations"],
  custom: [],
};
