export type MemoryId = string;
export type MemoryVersionId = string;
export type MemoryRelationshipId = string;
export type MemoryIndexEntryId = string;
export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type MemoryType =
  | "conversation"
  | "decision"
  | "project"
  | "client"
  | "supplier"
  | "employee"
  | "process"
  | "playbook"
  | "policy"
  | "document"
  | "meeting"
  | "learning"
  | "experience";

export type MemoryVisibility = "private" | "team" | "organization" | "public";

export type MemoryLifecycleStatus = "active" | "archived" | "superseded";
