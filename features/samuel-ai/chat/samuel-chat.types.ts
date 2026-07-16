import type { PipelineStep } from "@/apps/web/src/core/orchestrator";
import type { GmailActionPlan, GmailToolResult } from "@/features/gmail/gmail.types";
import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ChatMessage } from "../types";

export type SamuelChatCompanyContext = {
  executiveContext: ExecutiveContext | null;
  executiveSummary?: string | null;
  executiveRecommendation?: string | null;
  topPriorities?: string[];
  nextActions?: string[];
  health?: Record<string, number>;
  growthScore?: number | null;
  riskScore?: number | null;
};

export type SamuelChatRequest = {
  query: string;
  conversationId?: string | null;
  companyId: string;
  history?: ChatMessage[];
  companyContext?: SamuelChatCompanyContext | null;
};

export type SamuelChatRuntimeSummary = {
  intent: string;
  confidence: number;
  diagnosis: string;
  recommendation: string;
  nextStep: string;
  pipeline: PipelineStep[];
};

export type SamuelChatStreamEvent =
  | {
      type: "start";
      conversationId: string;
      messageId: string;
      persistence: "supabase" | "client";
    }
  | { type: "step"; step: PipelineStep }
  | { type: "provider"; provider: string; model: string | null }
  | { type: "warning"; code: string; message: string }
  | { type: "delta"; delta: string }
  | {
      type: "action_proposal";
      action: GmailActionPlan;
    }
  | {
      type: "action_result";
      result: GmailToolResult;
    }
  | {
      type: "complete";
      conversationId: string;
      message: ChatMessage;
      runtime: SamuelChatRuntimeSummary;
      provider: string;
      model: string | null;
      persistence: "supabase" | "client";
      pendingAction?: GmailActionPlan | null;
    }
  | {
      type: "cancelled";
      conversationId: string;
      message: string;
    }
  | {
      type: "error";
      code: string;
      message: string;
      retryable: boolean;
    };

export type SamuelChatSendOptions = {
  conversationId?: string | null;
  history: ChatMessage[];
  signal?: AbortSignal;
  onEvent?: (event: SamuelChatStreamEvent) => void;
};

export type SamuelChatSendResult = {
  content: string;
  conversationId: string;
  runtime: SamuelChatRuntimeSummary;
  provider: string;
  model: string | null;
};

export type SamuelChatHistoryResponse = {
  conversationId: string | null;
  messages: ChatMessage[];
  persistence: "supabase" | "client";
};
