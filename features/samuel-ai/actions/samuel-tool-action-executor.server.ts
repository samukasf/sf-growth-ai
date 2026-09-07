import "server-only";

import { createHash, randomUUID } from "node:crypto";

import {
  SamuelActionDuplicateRequestError,
  SamuelActionEngine,
  type SamuelActionResult,
  type SamuelActionRisk,
} from "@/apps/web/src/core/orchestrator";
import { SupabaseSamuelActionExecutionLedger } from "@/apps/web/src/core/orchestrator/samuel-action-ledger.server";
import {
  executeGmailTool,
  type GmailActionArgs,
  type GmailActionId,
  type GmailToolResult,
} from "@/features/gmail";
import {
  executeCalendarTool,
  type CalendarActionArgs,
  type CalendarActionId,
  type CalendarToolResult,
} from "@/features/google-calendar";

const GMAIL_READ_ACTIONS = new Set<GmailActionId>([
  "gmail_inbox",
  "gmail_search",
  "gmail_read",
  "gmail_unread_count",
  "gmail_list_labels",
]);

const GMAIL_SENSITIVE_ACTIONS = new Set<GmailActionId>([
  "gmail_send",
  "gmail_reply",
  "gmail_trash",
]);

const CALENDAR_READ_ACTIONS = new Set<CalendarActionId>([
  "calendar_today",
  "calendar_week",
  "calendar_search",
  "calendar_availability",
]);

function gmailRisk(actionId: GmailActionId): SamuelActionRisk {
  if (GMAIL_READ_ACTIONS.has(actionId)) return "read";
  if (GMAIL_SENSITIVE_ACTIONS.has(actionId)) return "sensitive";
  return "mutate";
}

function calendarRisk(actionId: CalendarActionId): SamuelActionRisk {
  if (CALENDAR_READ_ACTIONS.has(actionId)) return "read";
  if (actionId === "calendar_delete") return "sensitive";
  return "mutate";
}

function idempotencyKey(surface: "gmail" | "calendar", confirmationToken: string) {
  return createHash("sha256")
    .update(`${surface}:${confirmationToken}`)
    .digest("hex");
}

type ExecutionIdentity = {
  companyId: string;
  userId: string;
  sessionId: string;
  turnId: string;
  requestId?: string;
};

type ConfirmedExecution = {
  confirmationToken: string;
  approvedAt?: string;
};

export type SamuelToolExecution<TToolResult> = {
  result: TToolResult;
  orchestration: SamuelActionResult<TToolResult>;
};

function buildEngine(risk: SamuelActionRisk) {
  return new SamuelActionEngine(
    undefined,
    risk === "read" || risk === "draft"
      ? undefined
      : new SupabaseSamuelActionExecutionLedger(),
  );
}

export async function executeSamuelGmailAction(input: {
  identity: ExecutionIdentity;
  actionId: GmailActionId;
  args: GmailActionArgs;
  confirmation?: ConfirmedExecution;
}): Promise<SamuelToolExecution<GmailToolResult>> {
  const risk = gmailRisk(input.actionId);
  const engine = buildEngine(risk).register<GmailActionArgs, GmailToolResult>({
    actionId: input.actionId,
    risk,
    execute: () =>
      executeGmailTool(input.identity.companyId, input.actionId, input.args),
    verify:
      risk === "read"
        ? undefined
        : async (_context, _args, output) => ({
            verified: output.ok,
            evidence: {
              surface: "gmail",
              actionId: input.actionId,
              providerAcknowledged: output.ok,
            },
            reason: output.error ?? output.summary,
          }),
  });

  const requestId = input.identity.requestId ?? randomUUID();
  const orchestration = await engine.execute<GmailActionArgs, GmailToolResult>({
    actionId: input.actionId,
    input: input.args,
    context: {
      tenantId: `workspace-${input.identity.companyId}`,
      companyId: input.identity.companyId,
      userId: input.identity.userId,
      sessionId: input.identity.sessionId,
      turnId: input.identity.turnId,
      requestId,
      idempotencyKey: input.confirmation
        ? idempotencyKey("gmail", input.confirmation.confirmationToken)
        : undefined,
    },
    confirmation: input.confirmation
      ? {
          approved: true,
          approvedAt: input.confirmation.approvedAt ?? new Date().toISOString(),
          approvedBy: input.identity.userId,
        }
      : undefined,
  });

  const result =
    orchestration.output ??
    ({
      ok: false,
      actionId: input.actionId,
      summary: orchestration.error?.message ?? "Falha ao executar ação Gmail.",
      error: orchestration.error?.message,
    } satisfies GmailToolResult);

  return { result, orchestration };
}

export async function executeSamuelCalendarAction(input: {
  identity: ExecutionIdentity;
  actionId: CalendarActionId;
  args: CalendarActionArgs;
  confirmation?: ConfirmedExecution;
}): Promise<SamuelToolExecution<CalendarToolResult>> {
  const risk = calendarRisk(input.actionId);
  const engine = buildEngine(risk).register<CalendarActionArgs, CalendarToolResult>({
    actionId: input.actionId,
    risk,
    execute: () =>
      executeCalendarTool(input.identity.companyId, input.actionId, input.args),
    verify:
      risk === "read"
        ? undefined
        : async (_context, _args, output) => ({
            verified: output.ok,
            evidence: {
              surface: "calendar",
              actionId: input.actionId,
              providerAcknowledged: output.ok,
            },
            reason: output.error ?? output.summary,
          }),
  });

  const requestId = input.identity.requestId ?? randomUUID();
  const orchestration = await engine.execute<CalendarActionArgs, CalendarToolResult>({
    actionId: input.actionId,
    input: input.args,
    context: {
      tenantId: `workspace-${input.identity.companyId}`,
      companyId: input.identity.companyId,
      userId: input.identity.userId,
      sessionId: input.identity.sessionId,
      turnId: input.identity.turnId,
      requestId,
      idempotencyKey: input.confirmation
        ? idempotencyKey("calendar", input.confirmation.confirmationToken)
        : undefined,
    },
    confirmation: input.confirmation
      ? {
          approved: true,
          approvedAt: input.confirmation.approvedAt ?? new Date().toISOString(),
          approvedBy: input.identity.userId,
        }
      : undefined,
  });

  const result =
    orchestration.output ??
    ({
      ok: false,
      surface: "calendar",
      actionId: input.actionId,
      summary:
        orchestration.error?.message ?? "Falha ao executar ação Google Agenda.",
      error: orchestration.error?.message,
    } satisfies CalendarToolResult);

  return { result, orchestration };
}

export { SamuelActionDuplicateRequestError };
