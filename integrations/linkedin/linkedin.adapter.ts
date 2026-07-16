import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";
import {
  buildLinkedInExecutive,
  type LinkedInExecutive,
} from "@/features/linkedin/services/linkedin-executive.service";

import { createLinkedInClient } from "./linkedin.client";
import { mapSnapshotToMetrics, mapSnapshotToPosts } from "./linkedin.mapper";
import { LinkedInApiError } from "./linkedin.types";

export type LinkedInExecutiveEngines = {
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
  crmExecutive?: CrmExecutive | null;
  salesExecutive?: SalesExecutive | null;
};

export async function buildLinkedInExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: LinkedInExecutiveEngines = {},
): Promise<LinkedInExecutive> {
  const client = createLinkedInClient(companyId);
  const connection = await client.connect();
  if (connection.mode !== "live") {
    throw new LinkedInApiError(
      "NOT_CONFIGURED",
      "Integração LinkedIn sem uma conexão real validada.",
    );
  }

  const snapshot = await client.fetchSnapshot();
  const metrics = mapSnapshotToMetrics(snapshot);
  const { bestPosts, weakPosts } = mapSnapshotToPosts(snapshot);

  return buildLinkedInExecutive({
    ...engines,
    companyName: companyName ?? snapshot.organizationName,
    metrics,
    bestPosts,
    weakPosts,
    allowMockFallback: false,
  });
}
