import type { Metadata } from "next";

import { AgencyWorkspace, buildAgencyWorkspace } from "@/features/agency-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agency Workspace | SF Growth AI",
  description: "Workspace executivo da Influence Publicidade.",
};

export default async function AgencyWorkspacePage() {
  const data = await buildAgencyWorkspace();

  return <AgencyWorkspace data={data} />;
}
