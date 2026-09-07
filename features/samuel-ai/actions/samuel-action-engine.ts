export type SamuelActionRisk = "read" | "prepare" | "write" | "sensitive";

export type SamuelActionStatus =
  | "pending"
  | "awaiting_confirmation"
  | "executing"
  | "verifying"
  | "verified"
  | "failed";

export type SamuelActionEvidence = {
  source: string;
  operation: string;
  entityId?: string;
  at: string;
  metadata?: Record<string, unknown>;
};

export type SamuelActionSuccess<TOutput> = {
  ok: true;
  output: TOutput;
  evidence: SamuelActionEvidence;
  verified: true;
};

export type SamuelActionFailure = {
  ok: false;
  error: string;
  retryable?: boolean;
  verified: false;
};

export type SamuelActionResult<TOutput> =
  | SamuelActionSuccess<TOutput>
  | SamuelActionFailure;

export type SamuelActionExecutorResult<TOutput> = {
  output: TOutput;
  evidence?: SamuelActionEvidence | null;
};

export type SamuelActionDefinition<TInput, TOutput> = {
  name: string;
  description: string;
  risk: SamuelActionRisk;
  execute: (input: TInput) => Promise<SamuelActionExecutorResult<TOutput>>;
};

export type SamuelActionRequest<TInput> = {
  action: SamuelActionDefinition<TInput, unknown>;
  input: TInput;
  confirmed?: boolean;
};

export type SamuelActionRun<TOutput = unknown> = {
  actionName: string;
  risk: SamuelActionRisk;
  status: SamuelActionStatus;
  confirmationRequired: boolean;
  result: SamuelActionResult<TOutput> | null;
};

export type SamuelActionTransition = {
  status: SamuelActionStatus;
  at: string;
};

export type SamuelActionExecution<TOutput = unknown> = {
  run: SamuelActionRun<TOutput>;
  transitions: SamuelActionTransition[];
};

export function actionRequiresConfirmation(risk: SamuelActionRisk): boolean {
  return risk === "write" || risk === "sensitive";
}

function transition(
  transitions: SamuelActionTransition[],
  status: SamuelActionStatus,
): void {
  transitions.push({ status, at: new Date().toISOString() });
}

export async function executeSamuelAction<TInput, TOutput>(
  action: SamuelActionDefinition<TInput, TOutput>,
  input: TInput,
  options: { confirmed?: boolean } = {},
): Promise<SamuelActionExecution<TOutput>> {
  const confirmationRequired = actionRequiresConfirmation(action.risk);
  const transitions: SamuelActionTransition[] = [];

  transition(transitions, "pending");

  if (confirmationRequired && options.confirmed !== true) {
    transition(transitions, "awaiting_confirmation");

    return {
      run: {
        actionName: action.name,
        risk: action.risk,
        status: "awaiting_confirmation",
        confirmationRequired: true,
        result: null,
      },
      transitions,
    };
  }

  transition(transitions, "executing");

  try {
    const execution = await action.execute(input);
    transition(transitions, "verifying");

    if (!execution.evidence) {
      const result: SamuelActionFailure = {
        ok: false,
        error: "A execução não produziu evidência verificável.",
        retryable: false,
        verified: false,
      };

      transition(transitions, "failed");

      return {
        run: {
          actionName: action.name,
          risk: action.risk,
          status: "failed",
          confirmationRequired,
          result,
        },
        transitions,
      };
    }

    const result: SamuelActionSuccess<TOutput> = {
      ok: true,
      output: execution.output,
      evidence: execution.evidence,
      verified: true,
    };

    transition(transitions, "verified");

    return {
      run: {
        actionName: action.name,
        risk: action.risk,
        status: "verified",
        confirmationRequired,
        result,
      },
      transitions,
    };
  } catch (error) {
    const result: SamuelActionFailure = {
      ok: false,
      error: error instanceof Error ? error.message : "Falha desconhecida na execução.",
      retryable: true,
      verified: false,
    };

    transition(transitions, "failed");

    return {
      run: {
        actionName: action.name,
        risk: action.risk,
        status: "failed",
        confirmationRequired,
        result,
      },
      transitions,
    };
  }
}
