export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "linkedin",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type ContentFormat = "video" | "post";

export type ContentScene = {
  headline: string;
  supportingText: string;
  visualDirection: string;
  durationSeconds: number;
};

export type SocialCopy = {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
};

export type SamuelContentProject = {
  id: string;
  format: ContentFormat;
  name: string;
  objective: string;
  audience: string;
  hook: string;
  script: string;
  callToAction: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  scenes: ContentScene[];
  socialCopies: SocialCopy[];
  platforms: SocialPlatform[];
  provider: string;
  model: string | null;
  createdAt: string;
};

export type ContentReadiness = {
  generation: { ready: boolean; detail: string };
  narration: { ready: boolean; provider: string; detail: string };
  browserRenderer: { ready: true; detail: string };
  publishing: Record<SocialPlatform, { ready: boolean; detail: string }>;
};

