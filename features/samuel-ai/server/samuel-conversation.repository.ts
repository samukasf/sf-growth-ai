import "server-only";

import {
  createServerSupabaseAdmin,
  hasServerSupabaseConfiguration,
} from "@/lib/supabase/server";

import type { ChatMessage } from "../types";

type StoredMessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: ChatMessage["status"];
  created_at: string;
};

export type ConversationHistory = {
  conversationId: string;
  messages: ChatMessage[];
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export class SamuelConversationRepository {
  readonly available = hasServerSupabaseConfiguration();

  private get client() {
    return createServerSupabaseAdmin();
  }

  async loadLatest(
    sessionHash: string,
    companyRef: string,
  ): Promise<ConversationHistory | null> {
    if (!this.available) return null;

    const { data: conversation, error: conversationError } = await this.client
      .from("samuel_conversations")
      .select("id")
      .eq("session_hash", sessionHash)
      .eq("company_ref", companyRef)
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (conversationError) throw conversationError;
    if (!conversation) return null;

    const { data: rows, error: messageError } = await this.client
      .from("samuel_messages")
      .select("id, role, content, status, created_at")
      .eq("conversation_id", conversation.id)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: true })
      .limit(200);

    if (messageError) throw messageError;

    return {
      conversationId: conversation.id as string,
      messages: ((rows ?? []) as StoredMessageRow[]).map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        timestamp: row.created_at,
        status: row.status ?? "complete",
      })),
    };
  }

  async getOrCreate(input: {
    conversationId?: string | null;
    sessionHash: string;
    companyRef: string;
    title: string;
  }): Promise<string | null> {
    if (!this.available) return null;

    if (input.conversationId && isUuid(input.conversationId)) {
      const { data, error } = await this.client
        .from("samuel_conversations")
        .select("id")
        .eq("id", input.conversationId)
        .eq("session_hash", input.sessionHash)
        .eq("company_ref", input.companyRef)
        .maybeSingle();

      if (error) throw error;
      if (data?.id) return data.id as string;
    }

    const { data, error } = await this.client
      .from("samuel_conversations")
      .insert({
        company_id: isUuid(input.companyRef) ? input.companyRef : null,
        company_ref: input.companyRef,
        session_hash: input.sessionHash,
        title: input.title.slice(0, 120),
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id as string;
  }

  async appendMessage(
    conversationId: string,
    message: ChatMessage,
    metadata: Record<string, unknown> = {},
  ) {
    if (!this.available || !isUuid(conversationId)) return;

    const { error } = await this.client.from("samuel_messages").insert({
      id: isUuid(message.id) ? message.id : undefined,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      status: message.status ?? "complete",
      metadata,
      created_at: message.timestamp,
    });

    if (error) throw error;
  }

  async setProvider(
    conversationId: string,
    provider: string,
    model: string | null,
  ) {
    if (!this.available || !isUuid(conversationId)) return;

    const { error } = await this.client
      .from("samuel_conversations")
      .update({ provider, model, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) throw error;
  }
}
