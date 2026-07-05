import type { ExecutiveKnowledgeRecord } from "@/features/executive-knowledge/executive-knowledge.types";
import type { LearningEvent } from "@/features/executive-knowledge/executive-knowledge.types";
import type { ExecutiveConversation } from "@/features/samuel-ai/services/executive-conversation-orchestrator.service";
import type {
  ExecutiveInboxItem,
  InboxActionType,
} from "@/features/executive-inbox/executive-inbox.types";

import type { BusinessMemoryEntityType } from "../executive-memory-engine.types";
import { addBusinessMemoryEntry } from "./executive-memory-business.service";
import {
  mapKnowledgeCategoryToMemoryKind,
  registerExecutiveMemory,
} from "./executive-memory-engine.service";

function mapInboxActionToBusinessEntity(action: InboxActionType): BusinessMemoryEntityType | null {
  switch (action) {
    case "approve":
      return "decision";
    case "complete":
      return "result";
    case "defer":
      return "strategy";
    default:
      return null;
  }
}

export async function syncExecutiveKnowledgeToMemory(
  knowledge: ExecutiveKnowledgeRecord,
) {
  const memory = await registerExecutiveMemory({
    companyId: knowledge.companyId,
    userId: knowledge.userId,
    category: knowledge.category,
    context: knowledge.context,
    content: knowledge.content,
    origin: knowledge.origin,
    responsibleEngine: knowledge.responsibleEngine,
    importanceLevel: knowledge.scores.knowledgeScore,
    confidenceLevel: knowledge.confidenceScore,
    tags: [...knowledge.tags, "executive-knowledge"],
    memoryKind:
      knowledge.category === "question" || knowledge.category === "answer"
        ? "conversation"
        : mapKnowledgeCategoryToMemoryKind(knowledge.category),
    title: knowledge.title,
    knowledgeReferenceId: knowledge.id,
  });

  if (knowledge.category === "recommendation") {
    addBusinessMemoryEntry({
      companyId: knowledge.companyId,
      entityType: "strategy",
      title: knowledge.title,
      description: knowledge.content,
      context: knowledge.context,
      tags: knowledge.tags,
      memoryRecordId: memory.id,
    });
  }

  if (knowledge.category === "result") {
    addBusinessMemoryEntry({
      companyId: knowledge.companyId,
      entityType: "result",
      title: knowledge.title,
      description: knowledge.content,
      context: knowledge.context,
      tags: knowledge.tags,
      memoryRecordId: memory.id,
    });
  }

  return memory;
}

export async function syncLearningEventToMemory(event: LearningEvent) {
  return registerExecutiveMemory({
    companyId: event.companyId,
    userId: event.userId,
    category: event.type,
    context: event.description,
    content: event.description,
    origin: "executive-learning",
    responsibleEngine: "executive-learning-events",
    importanceLevel: 55,
    confidenceLevel: 60,
    tags: ["learning-event", event.type],
    memoryKind: "learning",
    title: event.title,
    knowledgeReferenceId: event.knowledgeRecordId,
  });
}

export async function syncConversationToExecutiveMemory(
  companyId: string,
  question: string,
  conversation: ExecutiveConversation | null,
) {
  const questionMemory = await registerExecutiveMemory({
    companyId,
    category: "conversation-question",
    context: question,
    content: question,
    origin: "samuel-ai",
    responsibleEngine: "executive-brain",
    importanceLevel: 60,
    confidenceLevel: conversation?.confidenceScore ?? 55,
    tags: ["conversation", "question", "executive-brain"],
    memoryKind: "conversation",
    title: question.slice(0, 120),
  });

  if (!conversation) return { questionMemory, answerMemory: null };

  const answerMemory = await registerExecutiveMemory({
    companyId,
    category: "conversation-answer",
    context: conversation.executiveConsensus.narrative,
    content:
      conversation.executiveSummary ??
      conversation.executiveConsensus.primaryRecommendation,
    origin: "samuel-ai",
    responsibleEngine: "executive-ceo",
    importanceLevel: 70,
    confidenceLevel: conversation.confidenceScore,
    tags: ["conversation", "answer", "executive-ceo"],
    memoryKind: "conversation",
    title: `Resposta: ${question.slice(0, 80)}`,
  });

  if (conversation.executiveConsensus.primaryRecommendation) {
    await registerExecutiveMemory({
      companyId,
      category: "recommendation",
      context: conversation.executiveConsensus.narrative,
      content: conversation.executiveConsensus.primaryRecommendation,
      origin: "executive-recommendation",
      responsibleEngine: "executive-recommendation",
      importanceLevel: 75,
      confidenceLevel: conversation.confidenceScore,
      tags: ["recommendation", "executive-recommendation"],
      memoryKind: "knowledge_reference",
      title: "Recomendação da conversa",
    });
  }

  return { questionMemory, answerMemory };
}

export async function syncInboxActionToExecutiveMemory(
  companyId: string,
  item: ExecutiveInboxItem,
  action: InboxActionType,
) {
  const memory = await registerExecutiveMemory({
    companyId,
    category: item.type,
    context: item.impact,
    content: item.description,
    origin: item.origin,
    responsibleEngine: item.origin || "executive-inbox",
    importanceLevel: Math.min(100, item.confidence + 10),
    confidenceLevel: item.confidence,
    tags: [item.type, item.area, action, ...item.categories],
    memoryKind:
      item.type === "decision"
        ? "decision"
        : item.type === "ceo"
          ? "relationship"
          : "short",
    title: `${item.title} — ${action}`,
  });

  const businessEntity = mapInboxActionToBusinessEntity(action);
  if (businessEntity) {
    addBusinessMemoryEntry({
      companyId,
      entityType: businessEntity,
      title: item.title,
      description: item.description,
      context: item.impact,
      tags: [item.type, action, ...item.categories],
      memoryRecordId: memory.id,
    });
  }

  return memory;
}
