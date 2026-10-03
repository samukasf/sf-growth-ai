import type {
  PipelineStep,
  SamuelConversationChannel,
} from "@/apps/web/src/core/orchestrator";
import type { GmailActionPlan, GmailToolResult } from "@/features/gmail/gmail.types";
import type { CalendarActionPlan, CalendarToolResult } from "@/features/google-calendar";
import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ChatMessage } from "../types";
import type { SamuelContentProject } from "../content-studio/samuel-content.types";
import type { SamuelMusicCommand } from "../music/samuel-music.types";
import type { SamuelMission } from "../agent/samuel-mission";

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
  channel?: SamuelConversationChannel;
};

export type SamuelWebSource = {
  title: string;
  url: string;
};

export type SamuelChatRuntimeSummary = {
  intent: string;
  confidence: number;
  diagnosis: string;
  recommendation: string;
  nextStep: string;
  pipeline: PipelineStep[];
};

export type SamuelToolActionPlan = GmailActionPlan | CalendarActionPlan;
export type SamuelToolResult = GmailToolResult | CalendarToolResult;

export type SamuelIntegrationConnectPrompt = {
  toolkit: string;
  label: string;
  url: string;
  sessionId: string;
};

export type SamuelSurfaceHandoff = {
  surface: "site-builder" | "studio";
  payload: {
    brief?: string;
    source?: string;
  };
};

export type SamuelChatStreamEvent =
  | {
      type: "start";
      conversationId: string;
      messageId: string;
      persistence: "supabase" | "client";
    }
  | { type: "step"; step: PipelineStep }
  | { type: "mission_plan"; mission: SamuelMission }
  | { type: "mission_update"; mission: SamuelMission }
  | { type: "provider"; provider: string; model: string | null }
  | { type: "warning"; code: string; message: string }
  | { type: "web_sources"; sources: SamuelWebSource[] }
  | { type: "integration_connect"; connection: SamuelIntegrationConnectPrompt }
  | { type: "content_project"; project: SamuelContentProject }
  | { type: "music_action"; command: SamuelMusicCommand }
  | { type: "delta"; delta: string }
  | {
      type: "action_proposal";
      action: SamuelToolActionPlan;
    }
  | {
      type: "action_result";
      result: SamuelToolResult;
    }
  | {
      type: "complete";
      conversationId: string;
      message: ChatMessage;
      runtime: SamuelChatRuntimeSummary;
      provider: string;
      model: string | null;
      persistence: "supabase" | "client";
      pendingAction?: SamuelToolActionPlan | null;
      handoff?: SamuelSurfaceHandoff | null;
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
  channel?: SamuelConversationChannel;
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
