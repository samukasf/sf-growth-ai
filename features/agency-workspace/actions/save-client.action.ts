"use server";

import { saveNewClient } from "../services/save-client.service";
import type { NewClientFormInput, SaveClientContext, SaveClientResult } from "../types/new-client.types";

export async function saveClientAction(
  input: NewClientFormInput,
  context: SaveClientContext,
): Promise<SaveClientResult> {
  return saveNewClient(input, context);
}
