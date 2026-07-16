import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

import {
  buildGoogleBusinessExecutive,
  type GoogleBusinessExecutive,
  type GoogleBusinessMetrics,
} from "../services/google-business-executive.service";
import {
  GoogleBusinessClient,
  resolveGoogleBusinessLocationName,
} from "./google-business.client";
import { mapSnapshotToMetrics } from "./google-business.mapper";
import type { GoogleBusinessApiSnapshot } from "./google-business.types";

export type GoogleBusinessExecutiveEngines = {
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

export async function fetchGoogleBusinessApiSnapshot(
  companyId?: string,
): Promise<GoogleBusinessApiSnapshot> {
  const locationName = resolveGoogleBusinessLocationName(companyId);
  const client = new GoogleBusinessClient({ locationName });

  await client.connect();

  const [profile, reviews, insights, photos, performance] = await Promise.all([
    client.getBusinessProfile(),
    client.getReviews(),
    client.getInsights(),
    client.getPhotos(),
    client.getPerformance(),
  ]);

  return { profile, reviews, insights, photos, performance };
}

export async function fetchGoogleBusinessMetrics(
  companyId?: string,
): Promise<GoogleBusinessMetrics> {
  const snapshot = await fetchGoogleBusinessApiSnapshot(companyId);
  return mapSnapshotToMetrics(snapshot);
}

export async function buildGoogleBusinessExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: GoogleBusinessExecutiveEngines = {},
): Promise<GoogleBusinessExecutive> {
  const metrics = await fetchGoogleBusinessMetrics(companyId);
  return buildGoogleBusinessExecutive({
    ...engines,
    companyName,
    metrics,
  });
}
