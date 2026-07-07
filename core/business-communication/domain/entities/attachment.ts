import type { AttachmentId, MessageId, OrganizationId } from "../../shared";

export type AttachmentType = "image" | "document" | "audio" | "video" | "other";

export type AttachmentProps = {
  id: AttachmentId;
  organizationId: OrganizationId;
  messageId: MessageId;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
  type: AttachmentType;
};

export class Attachment {
  readonly id: AttachmentId;
  readonly organizationId: OrganizationId;
  readonly messageId: MessageId;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly url?: string;
  readonly type: AttachmentType;

  private constructor(props: AttachmentProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.messageId = props.messageId;
    this.fileName = props.fileName;
    this.mimeType = props.mimeType;
    this.sizeBytes = props.sizeBytes;
    this.url = props.url;
    this.type = props.type;
  }

  static create(
    props: Omit<AttachmentProps, "id"> & { id?: AttachmentId },
  ): Attachment {
    return new Attachment({
      id: props.id ?? `attach-${Date.now()}`,
      organizationId: props.organizationId,
      messageId: props.messageId,
      fileName: props.fileName.trim(),
      mimeType: props.mimeType,
      sizeBytes: Math.max(0, props.sizeBytes),
      url: props.url,
      type: props.type,
    });
  }

  toJSON(): AttachmentProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      messageId: this.messageId,
      fileName: this.fileName,
      mimeType: this.mimeType,
      sizeBytes: this.sizeBytes,
      url: this.url,
      type: this.type,
    };
  }
}
