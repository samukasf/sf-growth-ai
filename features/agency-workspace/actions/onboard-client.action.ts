"use server";

import type { ClientOnboardingResult, NewClientFormInput, OnboardClientContext } from "../types/client-onboarding.types";
import { onboardNewClient } from "../services/onboard-client.service";

export async function onboardClientAction(
  input: NewClientFormInput,
  context: OnboardClientContext,
): Promise<ClientOnboardingResult> {
  return onboardNewClient(input, context);
}
