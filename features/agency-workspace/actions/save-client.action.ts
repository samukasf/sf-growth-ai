"use server";

import { saveNewClient } from "../services/save-client.service";
import type { NewClientFormInput, SaveClientContext, SaveClientResult } from "../types/new-client.types";
import { requireAuthenticatedUser } from "@/features/auth/server/authorization";

export async function saveClientAction(
  input: NewClientFormInput,
  context: SaveClientContext,
): Promise<SaveClientResult> {
  await requireAuthenticatedUser();
  return saveNewClient(input, context);
}
