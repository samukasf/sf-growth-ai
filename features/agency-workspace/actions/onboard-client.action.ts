"use server";

import type { ClientOnboardingResult, NewClientFormInput, OnboardClientContext } from "../types/client-onboarding.types";
import { onboardNewClient } from "../services/onboard-client.service";
import { requireAuthenticatedUser } from "@/features/auth/server/authorization";

export async function onboardClientAction(
  input: NewClientFormInput,
  context: OnboardClientContext,
): Promise<ClientOnboardingResult> {
  await requireAuthenticatedUser();
  return onboardNewClient(input, context);
}
