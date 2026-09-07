import { actionRiskRequiresConfirmation } from "./samuel-orchestration";
import type {
  SamuelActionRisk,
  SamuelTelemetryEvent,
  SamuelTelemetrySink,
} from "./samuel-orchestration.types";

export type SamuelActionConfirmation = {
  approved: boolean;
  approvedAt: string;
  approvedBy: string;
};

export type SamuelActionExecutionContext = {
  sessionId: string;
  turnId: string;
  tenantId: string;
  companyId: string;
  userId: string;
  requestId: string;
  idempotencyKey?: string;
};

export type SamuelActionVerification = {
  verified: boolean;
  evidence?: Record<string, unknown>;
  reason?: string;
};

export type SamuelActionDefinition<TInput, TOutput> = {
  actionId: string;
  risk: SamuelActionRisk;
  requiresConfirmation?: boolean;
  execute: (
    context: SamuelActionExecutionContext,
    input: TInput,
  ) => Promise<TOutput>;
  verify?: (
    context: SamuelActionExecutionContext,
    input: TInput,
    output: TOutput,
  ) => Promise<SamuelActionVerification>;
};

export type SamuelActionRequest<TInput> = {
  actionId: string;
  input: TInput;
  context: SamuelActionExecutionContext;
  confirmation?: SamuelActionConfirmation;
};

export type SamuelActionResult<TOutput> = {
  actionId: string;
  requestId: string;
  risk: SamuelActionRisk;
  status: "verified" | "executed_unverified" | "failed";
  output?: TOutput;
  evidence?: Record<string, unknown>;
  error?: { code: string; message: string };
  canClaimCompletion: boolean;
  durationMs: number;
};

export type SamuelActionLedgerReservation = {
  actionId: string;
  risk: SamuelActionRisk;
  context: SamuelActionExecutionContext;
  confirmation?: SamuelActionConfirmation;
};

export type SamuelActionLedgerCompletion = SamuelActionLedgerReservation & {
  status: SamuelActionResult<unknown>["status"];
  evidence?: Record<string, unknown>;
  error?: { code: string; message: string };
  durationMs: number;
};

export interface SamuelActionExecutionLedger {
  reserve(input: SamuelActionLedgerReservation): Promise<boolean>;
  finish(input: SamuelActionLedgerCompletion): Promise<void>;
}

export class SamuelActionNotRegisteredError extends Error {
  constructor(actionId: string) {
    super(`Ação não registrada no Samuel Action Engine: ${actionId}.`);
    this.name = "SamuelActionNotRegisteredError";
  }
}

export class SamuelActionConfirmationRequiredError extends Error {
  constructor(actionId: string) {
    super(`A ação ${actionId} exige confirmação explícita do utilizador autenticado.`);
    this.name = "SamuelActionConfirmationRequiredError";
  }
}

export class SamuelActionIdempotencyRequiredError extends Error {
  constructor(actionId: string) {
    super(`A ação ${actionId} exige idempotencyKey.`);
    this.name = "SamuelActionIdempotencyRequiredError";
  }
}

export class SamuelActionLedgerRequiredError extends Error {
  constructor(actionId: string) {
    super(`A ação ${actionId} exige um ledger persistente de idempotência.`);
    this.name = "SamuelActionLedgerRequiredError";
  }
}

export class SamuelActionDuplicateRequestError extends Error {
  constructor(actionId: string) {
    super(`A ação ${actionId} já foi processada para esta chave de idempotência.`);
    this.name = "SamuelActionDuplicateRequestError";
  }
}

type InternalActionDefinition = SamuelActionDefinition<unknown, unknown>;

export class SamuelActionEngine {
  private readonly definitions = new Map<string, InternalActionDefinition>();

  constructor(
    private readonly telemetry?: SamuelTelemetrySink,
    private readonly ledger?: SamuelActionExecutionLedger,
  ) {}

  register<TInput, TOutput>(definition: SamuelActionDefinition<TInput, TOutput>) {
    if (this.definitions.has(definition.actionId)) {
      throw new Error(`Ação já registrada: ${definition.actionId}.`);
    }
    this.definitions.set(definition.actionId, definition as InternalActionDefinition);
    return this;
  }

  has(actionId: string) {
    return this.definitions.has(actionId);
  }

  async execute<TInput, TOutput>(
    request: SamuelActionRequest<TInput>,
  ): Promise<SamuelActionResult<TOutput>> {
    const definition = this.definitions.get(request.actionId) as
      | SamuelActionDefinition<TInput, TOutput>
      | undefined;
    if (!definition) throw new SamuelActionNotRegisteredError(request.actionId);

    const startedAt = Date.now();
    const mutating = actionRiskRequiresConfirmation(definition.risk);
    const requiresConfirmation =
      definition.requiresConfirmation === true || mutating;

    if (
      requiresConfirmation &&
      (!request.confirmation?.approved ||
        request.confirmation.approvedBy !== request.context.userId)
    ) {
      await this.emit(request, definition.risk, {
        event: "action.blocked",
        outcome: "blocked",
        errorCode: "CONFIRMATION_REQUIRED",
      });
      throw new SamuelActionConfirmationRequiredError(request.actionId);
    }

    if (mutating && !request.context.idempotencyKey) {
      await this.emit(request, definition.risk, {
        event: "action.blocked",
        outcome: "blocked",
        errorCode: "IDEMPOTENCY_KEY_REQUIRED",
      });
      throw new SamuelActionIdempotencyRequiredError(request.actionId);
    }

    if (mutating && !this.ledger) {
      await this.emit(request, definition.risk, {
        event: "action.blocked",
        outcome: "blocked",
        errorCode: "IDEMPOTENCY_LEDGER_REQUIRED",
      });
      throw new SamuelActionLedgerRequiredError(request.actionId);
    }

    if (mutating && this.ledger) {
      const reserved = await this.ledger.reserve({
        actionId: request.actionId,
        risk: definition.risk,
        context: request.context,
        confirmation: request.confirmation,
      });
      if (!reserved) {
        await this.emit(request, definition.risk, {
          event: "action.blocked",
          outcome: "blocked",
          errorCode: "DUPLICATE_REQUEST",
        });
        throw new SamuelActionDuplicateRequestError(request.actionId);
      }
    }

    await this.emit(request, definition.risk, {
      event: "action.started",
      outcome: "started",
    });

    try {
      const output = await definition.execute(request.context, request.input);
      const durationMs = Date.now() - startedAt;

      await this.emit(request, definition.risk, {
        event: "action.executed",
        outcome: "success",
        durationMs,
      });

      if (!definition.verify) {
        const canClaimCompletion = !mutating;
        const result: SamuelActionResult<TOutput> = {
          actionId: request.actionId,
          requestId: request.context.requestId,
          risk: definition.risk,
          status: canClaimCompletion ? "verified" : "executed_unverified",
          output,
          canClaimCompletion,
          durationMs,
        };
        await this.finishLedger(request, definition.risk, result);
        return result;
      }

      const verification = await definition.verify(
        request.context,
        request.input,
        output,
      );
      const totalDurationMs = Date.now() - startedAt;

      if (!verification.verified) {
        await this.emit(request, definition.risk, {
          event: "action.failed",
          outcome: "failed",
          durationMs: totalDurationMs,
          errorCode: "VERIFICATION_FAILED",
        });
        const result: SamuelActionResult<TOutput> = {
          actionId: request.actionId,
          requestId: request.context.requestId,
          risk: definition.risk,
          status: "failed",
          output,
          evidence: verification.evidence,
          error: {
            code: "VERIFICATION_FAILED",
            message: verification.reason ?? "A execução não pôde ser verificada.",
          },
          canClaimCompletion: false,
          durationMs: totalDurationMs,
        };
        await this.finishLedger(request, definition.risk, result);
        return result;
      }

      await this.emit(request, definition.risk, {
        event: "action.verified",
        outcome: "success",
        durationMs: totalDurationMs,
      });
      const result: SamuelActionResult<TOutput> = {
        actionId: request.actionId,
        requestId: request.context.requestId,
        risk: definition.risk,
        status: "verified",
        output,
        evidence: verification.evidence,
        canClaimCompletion: true,
        durationMs: totalDurationMs,
      };
      await this.finishLedger(request, definition.risk, result);
      return result;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : "Falha desconhecida na ação.";
      await this.emit(request, definition.risk, {
        event: "action.failed",
        outcome: "failed",
        durationMs,
        errorCode: "EXECUTION_FAILED",
      });
      const result: SamuelActionResult<TOutput> = {
        actionId: request.actionId,
        requestId: request.context.requestId,
        risk: definition.risk,
        status: "failed",
        error: { code: "EXECUTION_FAILED", message },
        canClaimCompletion: false,
        durationMs,
      };
      await this.finishLedger(request, definition.risk, result);
      return result;
    }
  }

  private async finishLedger<TInput, TOutput>(
    request: SamuelActionRequest<TInput>,
    risk: SamuelActionRisk,
    result: SamuelActionResult<TOutput>,
  ) {
    if (!actionRiskRequiresConfirmation(risk) || !this.ledger) return;
    await this.ledger.finish({
      actionId: request.actionId,
      risk,
      context: request.context,
      confirmation: request.confirmation,
      status: result.status,
      evidence: result.evidence,
      error: result.error,
      durationMs: result.durationMs,
    });
  }

  private async emit<TInput>(
    request: SamuelActionRequest<TInput>,
    risk: SamuelActionRisk,
    partial: Pick<
      SamuelTelemetryEvent,
      "event" | "outcome" | "durationMs" | "errorCode"
    >,
  ) {
    if (!this.telemetry) return;
    await this.telemetry.emit({
      ...partial,
      sessionId: request.context.sessionId,
      turnId: request.context.turnId,
      companyId: request.context.companyId,
      userId: request.context.userId,
      actionId: request.actionId,
      requestId: request.context.requestId,
      risk,
      timestamp: new Date().toISOString(),
    });
  }
}

export class InMemorySamuelTelemetrySink implements SamuelTelemetrySink {
  readonly events: SamuelTelemetryEvent[] = [];

  emit(event: SamuelTelemetryEvent) {
    this.events.push(event);
  }
}

export class InMemorySamuelActionExecutionLedger implements SamuelActionExecutionLedger {
  readonly reservations = new Set<string>();
  readonly completions: SamuelActionLedgerCompletion[] = [];

  async reserve(input: SamuelActionLedgerReservation) {
    const key = `${input.context.companyId}:${input.context.idempotencyKey}`;
    if (this.reservations.has(key)) return false;
    this.reservations.add(key);
    return true;
  }

  async finish(input: SamuelActionLedgerCompletion) {
    this.completions.push(input);
  }
}
