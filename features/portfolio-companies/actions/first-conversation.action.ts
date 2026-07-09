"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";

import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";

export type FirstConversationAnswers = {
  main_service?: string;
  ideal_client?: string;
  main_challenge?: string;
  expectations?: string;
};

export type FirstConversationStatus = "pending" | "deferred" | "completed";

function revalidateCompanyPaths(companyId: string) {
  revalidatePath("/");
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${companyId}`);
  revalidatePath(`/empresas/${companyId}/conversa`);
}

export async function deferFirstConversationAction(
  companyId: string,
): Promise<PortfolioCompanyRecord> {
  const supabase = createServerSupabase();
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("portfolio_companies")
    .update({
      first_conversation_status: "deferred",
      updated_at: updatedAt,
    })
    .eq("id", companyId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateCompanyPaths(companyId);
  return data as PortfolioCompanyRecord;
}

export async function saveFirstConversationStepAction(
  companyId: string,
  answers: FirstConversationAnswers,
): Promise<PortfolioCompanyRecord> {
  const supabase = createServerSupabase();
  const updatedAt = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from("portfolio_companies")
    .select("first_conversation_answers")
    .eq("id", companyId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const mergedAnswers = {
    ...((existing?.first_conversation_answers as FirstConversationAnswers) ?? {}),
    ...answers,
  };

  const isComplete =
    Boolean(mergedAnswers.main_service?.trim()) &&
    Boolean(mergedAnswers.ideal_client?.trim()) &&
    Boolean(mergedAnswers.main_challenge?.trim()) &&
    Boolean(mergedAnswers.expectations?.trim());

  const { data, error } = await supabase
    .from("portfolio_companies")
    .update({
      first_conversation_answers: mergedAnswers,
      first_conversation_status: isComplete ? "completed" : "pending",
      first_conversation_completed_at: isComplete ? updatedAt : null,
      updated_at: updatedAt,
    })
    .eq("id", companyId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateCompanyPaths(companyId);
  return data as PortfolioCompanyRecord;
}
