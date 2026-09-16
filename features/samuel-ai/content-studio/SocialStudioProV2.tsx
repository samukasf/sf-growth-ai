"use client";

import { ProfessionalVideoGenerator } from "./ProfessionalVideoGenerator";
import { SocialStudioPro } from "./SocialStudioPro";

type Props = { companyId: string };

export function SocialStudioProV2({ companyId }: Props) {
  return (
    <div className="space-y-6">
      <ProfessionalVideoGenerator companyId={companyId} />
      <SocialStudioPro companyId={companyId} />
    </div>
  );
}
