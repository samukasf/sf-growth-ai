import "server-only";

import { createServerSupabaseAdmin } from "@/lib/supabase/server";

import type {
  SamuelActionExecutionLedger,
  SamuelActionLedgerCompletion,
  SamuelActionLedgerReservation,
} from "./samuel-action-engine";

export class SupabaseSamuelActionExecutionLedger
  implements SamuelActionExecutionLedger
{
  async reserve(input: SamuelActionLedgerReservation) {
    const idempotencyKey = input.context.idempotencyKey;
    if (!idempotencyKey) {
      throw new Error("idempotencyKey em falta no ledger do Samuel.");
    }

    const { error } = await createServerSupabaseAdmin()
      .from("samuel_action_executions")
      .insert({
        company_id: input.context.companyId,
        user_id: input.context.userId,
        session_id: input.context.sessionId,
        turn_id: input.context.turnId,
        request_id: input.context.requestId,
        action_id: input.actionId,
        idempotency_key: idempotencyKey,
        risk: input.risk,
        status: "started",
        confirmation_approved_at: input.confirmation?.approvedAt ?? null,
      });

    if (!error) return true;
    if (error.code === "23505") return false;
    throw error;
  }

  async finish(input: SamuelActionLedgerCompletion) {
    const idempotencyKey = input.context.idempotencyKey;
    if (!idempotencyKey) {
      throw new Error("idempotencyKey em falta ao finalizar ledger do Samuel.");
    }

    const { error } = await createServerSupabaseAdmin()
      .from("samuel_action_executions")
      .update({
        status: input.status,
        verification_evidence: input.evidence ?? null,
        error_code: input.error?.code ?? null,
        error_message: input.error?.message ?? null,
        duration_ms: input.durationMs,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", input.context.companyId)
      .eq("idempotency_key", idempotencyKey);

    if (error) throw error;
  }
}
