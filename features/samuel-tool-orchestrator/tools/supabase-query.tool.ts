/**
 * Supabase Query Tool (Sprint 85) — permite ao Samuel consultar dados reais
 * do Supabase através do Tool Orchestrator já existente.
 *
 * Diferente das demais Tools desta pasta, esta faz I/O externo (Supabase).
 * Isso é permitido porque `@/lib/supabase/client` é infraestrutura genérica
 * de dados — não é o Samuel. A Tool continua sem conhecer
 * `@/features/samuel-runtime` ou qualquer outro módulo do Samuel, mantendo
 * a regra de isolamento da Sprint 79.
 *
 * Segurança: a Tool NUNCA aceita SQL ou texto livre. Ela expõe apenas uma
 * whitelist fixa de `queryId`s, cada um mapeado a uma consulta somente-
 * leitura e parametrizada por `companyId` (nunca cross-tenant).
 */
import { supabase } from "@/lib/supabase/client";

import { ToolExecutionError } from "../tool-execution-error";
import type { Tool, ToolExecutionContext } from "../types";

export type SupabaseQueryId = "count_contacts" | "list_inactive_contacts" | "revenue_current_month";

export type SupabaseQueryToolInput = {
  queryId: SupabaseQueryId;
};

export type SupabaseQueryToolOutput = {
  queryId: SupabaseQueryId;
  summary: string;
  data: Record<string, unknown>;
};

/** Mesmo limiar já usado por `features/crm/services/crm-executive.service.ts`. */
const INACTIVE_DAYS = 30;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidLike(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function daysSince(dateIso: string): number {
  return Math.floor((Date.now() - new Date(dateIso).getTime()) / 86_400_000);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "erro desconhecido";
}

/** Kill-switch da Sprint 85: desliga a execução real sem deploy. */
function isSupabaseQueryToolEnabled(): boolean {
  return process.env.SAMUEL_SUPABASE_QUERY_TOOL_ENABLED !== "false";
}

async function countContacts(companyId: string): Promise<SupabaseQueryToolOutput> {
  const { count, error } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (error) {
    throw new ToolExecutionError("supabase-query", `Falha ao consultar contacts: ${describeError(error)}`);
  }

  const total = count ?? 0;
  return {
    queryId: "count_contacts",
    summary: `Você tem ${total} cliente(s)/contato(s) registrados no CRM.`,
    data: { total },
  };
}

type InactiveContactRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  updated_at: string;
};

async function listInactiveContacts(companyId: string): Promise<SupabaseQueryToolOutput> {
  const { data, error } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, company, updated_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new ToolExecutionError("supabase-query", `Falha ao consultar contacts: ${describeError(error)}`);
  }

  const rows = (data ?? []) as InactiveContactRow[];
  const inactive = rows
    .filter((row) => daysSince(row.updated_at) >= INACTIVE_DAYS)
    .map((row) => ({
      id: row.id,
      name: [row.first_name, row.last_name].filter(Boolean).join(" ") || row.company || "Sem nome",
      company: row.company,
      daysInactive: daysSince(row.updated_at),
    }));

  return {
    queryId: "list_inactive_contacts",
    summary:
      inactive.length > 0
        ? `${inactive.length} cliente(s) sem interação há ${INACTIVE_DAYS}+ dias.`
        : `Nenhum cliente inativo (sem interação há ${INACTIVE_DAYS}+ dias) encontrado.`,
    data: { inactiveCount: inactive.length, contacts: inactive.slice(0, 10) },
  };
}

type RevenueRow = {
  amount: number | string;
  received_date: string;
};

function formatEur(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "EUR" });
}

async function revenueCurrentMonth(companyId: string): Promise<SupabaseQueryToolOutput> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data, error } = await supabase
    .from("revenues")
    .select("amount, received_date")
    .eq("company_id", companyId)
    .gte("received_date", start.toISOString().slice(0, 10))
    .lt("received_date", end.toISOString().slice(0, 10));

  if (error) {
    throw new ToolExecutionError("supabase-query", `Falha ao consultar revenues: ${describeError(error)}`);
  }

  const rows = (data ?? []) as RevenueRow[];
  const total = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    queryId: "revenue_current_month",
    summary: `Faturamento registrado neste mês: ${formatEur(total)}.`,
    data: { total, currency: "EUR", recordCount: rows.length },
  };
}

const QUERY_HANDLERS: Record<SupabaseQueryId, (companyId: string) => Promise<SupabaseQueryToolOutput>> = {
  count_contacts: countContacts,
  list_inactive_contacts: listInactiveContacts,
  revenue_current_month: revenueCurrentMonth,
};

export class SupabaseQueryTool implements Tool<SupabaseQueryToolInput, SupabaseQueryToolOutput> {
  readonly name = "supabase-query";
  readonly description =
    "Executa uma consulta pré-autorizada e somente-leitura ao banco de dados real (Supabase) da empresa atual.";
  readonly inputSchema = {
    queryId: "'count_contacts' | 'list_inactive_contacts' | 'revenue_current_month'",
  };

  async execute(
    context: ToolExecutionContext<SupabaseQueryToolInput>,
  ): Promise<SupabaseQueryToolOutput> {
    if (!isSupabaseQueryToolEnabled()) {
      throw new ToolExecutionError(
        this.name,
        "Supabase Query Tool está desabilitada (SAMUEL_SUPABASE_QUERY_TOOL_ENABLED=false).",
      );
    }

    const { queryId } = context.input;
    const handler = QUERY_HANDLERS[queryId];

    if (!handler) {
      throw new ToolExecutionError(this.name, `queryId desconhecido ou não autorizado: "${queryId}".`);
    }

    if (!isUuidLike(context.companyId)) {
      throw new ToolExecutionError(
        this.name,
        `companyId ausente ou inválido — não é possível consultar dados reais para "${context.companyId ?? "undefined"}".`,
      );
    }

    return handler(context.companyId);
  }
}
