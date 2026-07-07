import type { MemoryId, MemoryVersionId, OrganizationId, CompanyId } from "../../shared";

export type MemoryVersionProps = {
  id: MemoryVersionId;
  memoryId: MemoryId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  versionNumber: number;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  createdBy: string;
  changeReason: string;
};

export class MemoryVersion {
  readonly id: MemoryVersionId;
  readonly memoryId: MemoryId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly versionNumber: number;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly changeReason: string;

  private constructor(props: MemoryVersionProps) {
    this.id = props.id;
    this.memoryId = props.memoryId;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.versionNumber = props.versionNumber;
    this.title = props.title;
    this.summary = props.summary;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
    this.changeReason = props.changeReason;
  }

  static create(
    props: Omit<MemoryVersionProps, "id" | "createdAt"> & {
      id?: MemoryVersionId;
      createdAt?: string;
    },
  ): MemoryVersion {
    return new MemoryVersion({
      id: props.id ?? `mver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      memoryId: props.memoryId,
      organizationId: props.organizationId,
      companyId: props.companyId,
      versionNumber: props.versionNumber,
      title: props.title,
      summary: props.summary,
      content: props.content,
      createdAt: props.createdAt ?? new Date().toISOString(),
      createdBy: props.createdBy,
      changeReason: props.changeReason,
    });
  }

  toJSON(): MemoryVersionProps {
    return {
      id: this.id,
      memoryId: this.memoryId,
      organizationId: this.organizationId,
      companyId: this.companyId,
      versionNumber: this.versionNumber,
      title: this.title,
      summary: this.summary,
      content: this.content,
      createdAt: this.createdAt,
      createdBy: this.createdBy,
      changeReason: this.changeReason,
    };
  }
}
