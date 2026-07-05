import type {
  LearningEvent,
  LearningEventsState,
  LearningEventType,
} from "../executive-knowledge.types";

const STORAGE_PREFIX = "sf-executive-learning-events";

function storageKey(companyId: string) {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function createLearningEventId() {
  return `learning-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadLearningEvents(companyId: string): LearningEvent[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as LearningEventsState;
    return parsed.events ?? [];
  } catch {
    return [];
  }
}

function saveLearningEventsLocal(
  companyId: string,
  events: LearningEvent[],
): LearningEventsState {
  const state: LearningEventsState = {
    companyId,
    events,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(storageKey(companyId), JSON.stringify(state));
  }

  return state;
}

export type RegisterLearningEventInput = {
  companyId: string;
  userId?: string;
  type: LearningEventType;
  title: string;
  description: string;
  knowledgeRecordId?: string;
  metadata?: Record<string, string>;
};

export async function registerLearningEvent(
  input: RegisterLearningEventInput,
): Promise<LearningEvent> {
  const event: LearningEvent = {
    id: createLearningEventId(),
    companyId: input.companyId,
    userId: input.userId ?? "executive-user",
    timestamp: new Date().toISOString(),
    type: input.type,
    title: input.title,
    description: input.description,
    knowledgeRecordId: input.knowledgeRecordId,
    metadata: input.metadata,
  };

  const events = loadLearningEvents(input.companyId);
  saveLearningEventsLocal(input.companyId, [event, ...events].slice(0, 200));
  return event;
}

export function mapInboxActionToLearningEventType(
  action: string,
): LearningEventType {
  switch (action) {
    case "approve":
      return "new_decision";
    case "complete":
      return "goal_achieved";
    case "dismiss":
      return "error_identified";
    case "defer":
      return "problem_resolved";
    default:
      return "inbox_action";
  }
}

export function mapInboxCategoryToLearningEventType(
  category: string,
): LearningEventType {
  switch (category) {
    case "strategy":
      return "new_strategy";
    case "campaign":
      return "new_campaign";
    case "recommendation":
      return "new_recommendation";
    case "insight":
      return "new_insight";
    case "decision":
      return "new_decision";
    default:
      return "inbox_action";
  }
}
