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

export class SamuelActionNotRegisteredError extends Error {
  constructor(actionId: string) {
    super(`Ação não registrada no Samuel Action Engine: ${actionId}.`);
    this.name = "SamuelActionNotRegisteredError";
  }
}

export class SamuelActionConfirmationRequiredError extends Error {
  constructor(actionId: string) {
    super(`A ação ${actionId} exige confirmação explícita.`);
    this.name = "SamuelActionConfirmationRequiredError";
  }
}

export class SamuelActionIdempotencyRequiredError extends Error {
  constructor(actionId: string) {
    super(`A ação ${actionId} exige idempotencyKey.`);
    this.name = "SamuelActionIdempotencyRequiredError";
  }
}

type InternalActionDefinition = SamuelActionDefinition<unknown, unknown>;

export class SamuelActionEngine {
  private readonly definitions = new Map<string, InternalActionDefinition>();

  constructor(private readonly telemetry?: SamuelTelemetrySink) {}

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
    const requiresConfirmation =
      definition.requiresConfirmation === true ||
      actionRiskRequiresConfirmation(definition.risk);

    if (requiresConfirmation && !request.confirmation?.approved) {
      await this.emit(request, definition.risk, {
        event: "action.blocked",
        outcome: "blocked",
        errorCode: "CONFIRMATION_REQUIRED",
      });
      throw new SamuelActionConfirmationRequiredError(request.actionId);
    }

    if (
      actionRiskRequiresConfirmation(definition.risk) &&
      !request.context.idempotencyKey
    ) {
      await this.emit(request, definition.risk, {
        event: "action.blocked",
        outcome: "blocked",
        errorCode: "IDEMPOTENCY_KEY_REQUIRED",
      });
      throw new SamuelActionIdempotencyRequiredError(request.actionId);
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
        const canClaimCompletion = !actionRiskRequiresConfirmation(definition.risk);
        return {
          actionId: request.actionId,
          requestId: request.context.requestId,
          risk: definition.risk,
          status: canClaimCompletion ? "verified" : "executed_unverified",
          output,
          canClaimCompletion,
          durationMs,
        };
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
        return {
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
      }

      await this.emit(request, definition.risk, {
        event: "action.verified",
        outcome: "success",
        durationMs: totalDurationMs,
      });
      return {
        actionId: request.actionId,
        requestId: request.context.requestId,
        risk: definition.risk,
        status: "verified",
        output,
        evidence: verification.evidence,
        canClaimCompletion: true,
        durationMs: totalDurationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : "Falha desconhecida na ação.";
      await this.emit(request, definition.risk, {
        event: "action.failed",
        outcome: "failed",
        durationMs,
        errorCode: "EXECUTION_FAILED",
      });
      return {
        actionId: request.actionId,
        requestId: request.context.requestId,
        risk: definition.risk,
        status: "failed",
        error: { code: "EXECUTION_FAILED", message },
        canClaimCompletion: false,
        durationMs,
      };
    }
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
