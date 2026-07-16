export type SamuelStudioProjectType = "site" | "app";

export type SamuelStudioProject = {
  id: string;
  type: SamuelStudioProjectType;
  name: string;
  summary: string;
  files: Record<string, string>;
  provider: string;
  model: string | null;
  createdAt: string;
};

export type SamuelStudioGenerateRequest = {
  type: SamuelStudioProjectType;
  brief: string;
  mode?: "create" | "refine";
  changeRequest?: string;
  existingProject?: SamuelStudioProject;
};

export type SamuelStudioGenerateResponse = {
  project: SamuelStudioProject;
  source: "gateway" | "starter";
  warning?: string;
  diagnostic?: {
    structured: string;
    plain: string;
  };
};

export type SamuelStudioStatus = {
  gatewayConfigured: boolean;
  openHandsConfigured: boolean;
  engines: Array<{
    id: "gateway" | "sandpack" | "piper" | "openhands";
    label: string;
    status: "active" | "ready" | "configuration_required";
    detail: string;
  }>;
};
