import { APP_DESCRIPTION, APP_NAME } from "@/constants";

export const appConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
