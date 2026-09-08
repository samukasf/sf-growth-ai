export type SamuelCapabilityAvailability =
  | "connected"
  | "configuration_required"
  | "planned";

export type SamuelCapabilityDomain =
  | "research"
  | "growth"
  | "sales"
  | "workspace"
  | "desktop"
  | "creative"
  | "social";

export type SamuelExecutionClass = "read" | "draft" | "mutate" | "sensitive";

export type SamuelEvidencePolicy =
  | "source"
  | "ledger"
  | "platform_receipt"
  | "visual"
  | "artifact";

export type SamuelCapabilityExecutor =
  | {
      kind: "server_route";
      endpoint: string;
      method: "GET" | "POST";
    }
  | {
      kind: "action_engine";
      subject: "gmail" | "calendar" | "drive";
    }
  | {
      kind: "desktop";
      action: "computer.task";
    }
  | {
      kind: "provider";
      provider: string;
      operation: string;
    };

export type SamuelCapabilityDefinition = {
  id: string;
  title: string;
  description: string;
  domain: SamuelCapabilityDomain;
  availability: SamuelCapabilityAvailability;
  executionClass: SamuelExecutionClass;
  minimumAutonomy: 0 | 1 | 2 | 3;
  requiresApproval: boolean;
  evidencePolicy: SamuelEvidencePolicy;
  executor: SamuelCapabilityExecutor | null;
  timeoutMs: number;
  cancellable: boolean;
  voiceEnabled: boolean;
  requirements: string[];
};

export type SamuelCapabilityExecutionRequest = {
  capabilityId: string;
  companyId: string;
  autonomy: 0 | 1 | 2 | 3;
  approved?: boolean;
  input?: Record<string, unknown>;
  satisfiedRequirements?: string[];
};

export type SamuelCapabilityExecutionStatus =
  | "ready"
  | "approval_required"
  | "configuration_required"
  | "planned"
  | "blocked";

export type SamuelCapabilityExecutionPlan = {
  capabilityId: string;
  companyId: string;
  status: SamuelCapabilityExecutionStatus;
  reason: string;
  executionClass: SamuelExecutionClass | null;
  evidencePolicy: SamuelEvidencePolicy | null;
  executor: SamuelCapabilityExecutor | null;
  payload: Record<string, unknown>;
  timeoutMs: number | null;
  cancellable: boolean;
  missingRequirements: string[];
};
