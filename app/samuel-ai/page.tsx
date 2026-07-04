import type { Metadata } from "next";

import { samuelAi } from "@/features";

export const metadata: Metadata = {
  title: "Samuel AI™ | SF Growth AI",
  description: "Seu executivo de inteligência artificial.",
};

export default function SamuelAiRoute() {
  return <samuelAi.SamuelAiPage />;
}
