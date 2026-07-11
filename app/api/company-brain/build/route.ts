import { NextResponse } from "next/server";
import {
  CompanyProfile,
  DiscoverySession,
  type DiscoveryReport,
} from "@/core/company-discovery";
import {
  getCompanyBrainService,
  presentCompanyBrain,
  type DiscoveryResult,
} from "@/apps/web/src/core/company-brain";

type BuildRequestBody = {
  discovery?: DiscoveryResult | SerializedDiscoveryResult;
};

type SerializedDiscoveryResult = {
  session: ReturnType<DiscoverySession["toJSON"]>;
  profile: ReturnType<CompanyProfile["toJSON"]>;
  report: DiscoveryReport;
};

function isSerializedDiscovery(value: BuildRequestBody["discovery"]): value is SerializedDiscoveryResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as SerializedDiscoveryResult;
  return Boolean(candidate.session && candidate.profile && candidate.report);
}

function deserializeDiscovery(input: SerializedDiscoveryResult): DiscoveryResult {
  const session = DiscoverySession.create(input.session);
  let profile = CompanyProfile.create(input.profile);

  for (const section of input.profile.sections) {
    profile = profile.withSection(section);
  }

  profile = profile.withCompleteness(
    input.profile.completenessScore,
    input.profile.lastDiscoverySessionId,
  );

  return {
    session,
    profile,
    report: input.report,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BuildRequestBody;

    if (!body.discovery) {
      return NextResponse.json(
        { error: "discovery payload is required" },
        { status: 400 },
      );
    }

    const discovery = isSerializedDiscovery(body.discovery)
      ? deserializeDiscovery(body.discovery)
      : body.discovery;

    const service = getCompanyBrainService();
    const brain = await service.build({ discovery });
    const validation = service.validate(brain);
    const presentation = presentCompanyBrain(brain, discovery);

    return NextResponse.json({
      brain,
      validation,
      presentation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
