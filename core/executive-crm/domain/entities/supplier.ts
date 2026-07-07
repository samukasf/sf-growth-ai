import type { OrganizationId, SupplierId } from "../../shared";

export type SupplierStatus = "active" | "inactive" | "under_review";
export type SupplierCategory = "goods" | "services" | "technology" | "logistics" | "other";

export type SupplierProps = {
  id: SupplierId;
  organizationId: OrganizationId;
  name: string;
  email: string;
  phone?: string;
  category: SupplierCategory;
  status: SupplierStatus;
  score: number;
  contractValue: number;
  createdAt: string;
  updatedAt: string;
};

export class Supplier {
  readonly id: SupplierId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly category: SupplierCategory;
  readonly status: SupplierStatus;
  readonly score: number;
  readonly contractValue: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: SupplierProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.category = props.category;
    this.status = props.status;
    this.score = props.score;
    this.contractValue = props.contractValue;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<SupplierProps, "id" | "createdAt" | "updatedAt" | "status" | "score"> & {
      id?: SupplierId;
      createdAt?: string;
      updatedAt?: string;
      status?: SupplierStatus;
      score?: number;
    },
  ): Supplier {
    const now = new Date().toISOString();
    return new Supplier({
      id: props.id ?? `supplier-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      email: props.email.trim(),
      phone: props.phone,
      category: props.category,
      status: props.status ?? "active",
      score: props.score ?? 50,
      contractValue: props.contractValue,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): SupplierProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      category: this.category,
      status: this.status,
      score: this.score,
      contractValue: this.contractValue,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
