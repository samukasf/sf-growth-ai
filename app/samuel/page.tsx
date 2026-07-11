import type { Metadata } from "next";

import { SamuelRuntimePage } from "@/features/samuel-runtime/components/samuel-runtime-page";
import {
  getFirstCompany,
} from "@/services/executive-context.service";

export const metadata: Metadata = {
  title: "Samuel | SF Growth AI",
  description: "Converse com o Samuel AI — Runtime Alpha.",
};

export default async function SamuelRoute() {
  let companyId: string | undefined;
  let companyName: string | undefined;

  try {
    const company = await getFirstCompany();
    if (company) {
      companyId = company.id;
      companyName = company.name;
    }
  } catch {
    companyId = undefined;
    companyName = undefined;
  }

  return (
    <SamuelRuntimePage
      companyId={companyId}
      companyName={companyName}
    />
  );
}
