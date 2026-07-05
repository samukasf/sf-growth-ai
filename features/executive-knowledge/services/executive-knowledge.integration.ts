import type { ExecutiveConversation } from "@/features/samuel-ai/services/executive-conversation-orchestrator.service";
import type {
  ExecutiveInboxItem,
  InboxActionType,
  InboxItemType,
} from "@/features/executive-inbox/executive-inbox.types";

import type { KnowledgeCategory, LearningEventType } from "../executive-knowledge.types";
import { registerExecutiveKnowledge } from "./executive-knowledge.service";
import {
  mapInboxActionToLearningEventType,
  registerLearningEvent,
} from "./executive-learning-events.service";
import { addPlaybookEntry } from "./executive-playbook.service";

function mapInboxTypeToLearningEventType(type: InboxItemType): LearningEventType {
  switch (type) {
    case "decision":
      return "new_decision";
    case "recommendation":
      return "new_recommendation";
    case "action":
      return "new_campaign";
    case "alert":
      return "error_identified";
    case "ceo":
      return "new_insight";
    default:
      return "inbox_action";
  }
}

function mapInboxActionToKnowledgeCategory(action: InboxActionType): KnowledgeCategory {
  switch (action) {
    case "approve":
      return "decision";
    case "complete":
      return "result";
    case "dismiss":
      return "feedback";
    case "defer":
      return "executed_action";
  }
}

export async function captureKnowledgeFromInboxAction(
  companyId: string,
  item: ExecutiveInboxItem,
  action: InboxActionType,
) {
  const category = mapInboxActionToKnowledgeCategory(action);
  const learningType = mapInboxTypeToLearningEventType(item.type);
  const actionLearningType = mapInboxActionToLearningEventType(action);
  const tags = [item.type, item.area, action, ...item.categories];

  const record = await registerExecutiveKnowledge({
    companyId,
    category,
    origin: "executive-inbox",
    title: `${item.title} — ${action}`,
    content: item.description,
    context: item.impact,
    involvedModules: [item.origin, item.area, ...item.categories],
    responsibleEngine: item.origin || "executive-inbox",
    confidenceScore: item.confidence,
    tags,
  });

  await registerLearningEvent({
    companyId,
    type: actionLearningType,
    title: item.title,
    description: `Ação ${action} registrada na Executive Inbox.`,
    knowledgeRecordId: record.id,
    metadata: {
      itemId: item.id,
      action,
      type: item.type,
      area: item.area,
    },
  });

  if (learningType !== "inbox_action") {
    await registerLearningEvent({
      companyId,
      type: learningType,
      title: item.title,
      description: item.description,
      knowledgeRecordId: record.id,
    });
  }

  if (action === "complete") {
    addPlaybookEntry({
      companyId,
      type: "lesson_learned",
      title: item.title,
      description: item.description,
      context: item.impact,
      tags,
      knowledgeRecordIds: [record.id],
    });
  }

  if (action === "approve") {
    addPlaybookEntry({
      companyId,
      type: "best_practice",
      title: item.title,
      description: item.description,
      context: item.impact,
      tags,
      knowledgeRecordIds: [record.id],
    });
  }

  return record;
}

export async function captureKnowledgeFromConversation(
  companyId: string,
  question: string,
  conversation: ExecutiveConversation | null,
  answer?: string | null,
) {
  const questionRecord = await registerExecutiveKnowledge({
    companyId,
    category: "question",
    origin: "samuel-ai",
    title: question.slice(0, 120),
    content: question,
    context: conversation?.request.question ?? question,
    involvedModules: ["samuel-ai", "executive-brain"],
    responsibleEngine: "executive-conversation-orchestrator",
    confidenceScore: conversation?.confidenceScore ?? 55,
    tags: ["conversation", "question"],
  });

  await registerLearningEvent({
    companyId,
    type: "conversation",
    title: "Nova pergunta executiva",
    description: question,
    knowledgeRecordId: questionRecord.id,
  });

  if (!conversation && !answer) {
    return { questionRecord, answerRecord: null };
  }

  const responseText =
    answer ??
    conversation?.executiveSummary ??
    conversation?.executiveConsensus.narrative ??
    conversation?.executiveConsensus.primaryRecommendation ??
    "";

  if (!responseText) {
    return { questionRecord, answerRecord: null };
  }

  const answerRecord = await registerExecutiveKnowledge({
    companyId,
    category: "answer",
    origin: "samuel-ai",
    title: `Resposta: ${question.slice(0, 80)}`,
    content: responseText,
    context: conversation?.executiveConsensus.narrative ?? "",
    involvedModules: conversation?.participatingExecutives.map((item) => item.id) ?? [
      "samuel-ai",
    ],
    responsibleEngine: "executive-conversation-orchestrator",
    confidenceScore: conversation?.confidenceScore ?? 65,
    tags: ["conversation", "answer"],
  });

  await registerExecutiveKnowledge({
    companyId,
    category: "analysis",
    origin: "samuel-ai",
    title: `Análise: ${question.slice(0, 80)}`,
    content:
      conversation?.executiveReasoning?.conclusions
        .map((conclusion) => conclusion.justification || conclusion.title)
        .join(" ") ?? responseText,
    context: conversation?.executiveConsensus.narrative ?? "",
    involvedModules: ["executive-brain", "executive-ceo"],
    responsibleEngine: "executive-conversation-orchestrator",
    confidenceScore: conversation?.confidenceScore ?? 60,
    tags: ["conversation", "analysis"],
  });

  if (conversation?.executiveConsensus.primaryRecommendation) {
    const recommendationRecord = await registerExecutiveKnowledge({
      companyId,
      category: "recommendation",
      origin: "samuel-ai",
      title: "Recomendação executiva",
      content: conversation.executiveConsensus.primaryRecommendation,
      context: conversation.executiveConsensus.narrative,
      involvedModules: ["executive-recommendation"],
      responsibleEngine: "executive-recommendation",
      confidenceScore: conversation.confidenceScore ?? 70,
      tags: ["conversation", "recommendation"],
    });

    await registerLearningEvent({
      companyId,
      type: "new_recommendation",
      title: "Nova recomendação via conversa",
      description: conversation.executiveConsensus.primaryRecommendation,
      knowledgeRecordId: recommendationRecord.id,
    });
  }

  return { questionRecord, answerRecord };
}
