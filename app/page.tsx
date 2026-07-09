import type { Metadata } from "next";

import { APP_NAME } from "@/constants";
import { ExecutiveHome } from "@/features/executive-home";

export const metadata: Metadata = {
  title: `Executive Home | ${APP_NAME}`,
  description: "Primeira experiência oficial do SF Growth AI.",
};

export default function Home() {
  return <ExecutiveHome />;
}
