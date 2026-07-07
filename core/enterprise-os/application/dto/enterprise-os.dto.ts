export type RegisterPlatformDto = {
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  modulePath: string;
  version: string;
};

export type RegisterCapabilityDto = {
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  domain: string;
  platformId: string;
};

export type StartWorkflowDto = {
  organizationId: string;
  name: string;
  description: string;
  contextId: string;
  steps: Array<{
    id: string;
    platformId: string;
    capabilityId: string;
    action: string;
  }>;
};

export type CompleteWorkflowDto = {
  organizationId: string;
  workflowId: string;
};

export type ChangeBusinessStateDto = {
  organizationId: string;
  entityType: string;
  entityId: string;
  newState: string;
  metadata?: Record<string, string>;
};

export type StartSessionDto = {
  organizationId: string;
  userId: string;
  contextId: string;
  activePlatformIds?: string[];
};

export type CheckHealthDto = {
  organizationId: string;
};
