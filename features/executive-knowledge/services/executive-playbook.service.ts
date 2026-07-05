import type {
  ExecutivePlaybook,
  ExecutivePlaybookEntry,
  PlaybookEntryType,
} from "../executive-knowledge.types";

const STORAGE_PREFIX = "sf-executive-playbook";

function storageKey(companyId: string) {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function createPlaybookEntryId() {
  return `playbook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyPlaybook(companyId: string): ExecutivePlaybook {
  return {
    companyId,
    bestPractices: [],
    winningStrategies: [],
    recurringCases: [],
    recurringErrors: [],
    lessonsLearned: [],
    updatedAt: new Date().toISOString(),
  };
}

function bucketForType(type: PlaybookEntryType): keyof Omit<ExecutivePlaybook, "companyId" | "updatedAt"> {
  switch (type) {
    case "best_practice":
      return "bestPractices";
    case "winning_strategy":
      return "winningStrategies";
    case "recurring_case":
      return "recurringCases";
    case "recurring_error":
      return "recurringErrors";
    case "lesson_learned":
      return "lessonsLearned";
  }
}

export function loadExecutivePlaybook(companyId: string): ExecutivePlaybook {
  if (!isBrowser()) return emptyPlaybook(companyId);

  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return emptyPlaybook(companyId);
    return JSON.parse(raw) as ExecutivePlaybook;
  } catch {
    return emptyPlaybook(companyId);
  }
}

function saveExecutivePlaybook(playbook: ExecutivePlaybook): ExecutivePlaybook {
  const nextPlaybook = {
    ...playbook,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(storageKey(playbook.companyId), JSON.stringify(nextPlaybook));
  }

  return nextPlaybook;
}

export type CreatePlaybookEntryInput = {
  companyId: string;
  type: PlaybookEntryType;
  title: string;
  description: string;
  context?: string;
  tags?: string[];
  knowledgeRecordIds?: string[];
};

export function createPlaybookEntry(
  input: CreatePlaybookEntryInput,
): ExecutivePlaybookEntry {
  const now = new Date().toISOString();

  return {
    id: createPlaybookEntryId(),
    companyId: input.companyId,
    type: input.type,
    title: input.title,
    description: input.description,
    context: input.context ?? "",
    tags: input.tags ?? [],
    knowledgeRecordIds: input.knowledgeRecordIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addPlaybookEntry(input: CreatePlaybookEntryInput): ExecutivePlaybook {
  const playbook = loadExecutivePlaybook(input.companyId);
  const entry = createPlaybookEntry(input);
  const bucket = bucketForType(input.type);

  return saveExecutivePlaybook({
    ...playbook,
    [bucket]: [entry, ...playbook[bucket]],
  });
}

export function buildExecutivePlaybookSummary(companyId: string) {
  const playbook = loadExecutivePlaybook(companyId);

  return {
    companyId,
    totals: {
      bestPractices: playbook.bestPractices.length,
      winningStrategies: playbook.winningStrategies.length,
      recurringCases: playbook.recurringCases.length,
      recurringErrors: playbook.recurringErrors.length,
      lessonsLearned: playbook.lessonsLearned.length,
    },
    updatedAt: playbook.updatedAt,
  };
}
