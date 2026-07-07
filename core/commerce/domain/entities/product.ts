import type { OrganizationId, ProductId } from "../../shared";

export type ProductStatus = "draft" | "active" | "archived";

export type ProductProps = {
  id: ProductId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export class Product {
  readonly id: ProductId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly sku: string;
  readonly price: number;
  readonly currency: string;
  readonly stock: number;
  readonly category: string;
  readonly status: ProductStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ProductProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.sku = props.sku;
    this.price = props.price;
    this.currency = props.currency;
    this.stock = props.stock;
    this.category = props.category;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ProductProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: ProductId;
      createdAt?: string;
      updatedAt?: string;
      status?: ProductStatus;
    },
  ): Product {
    const now = new Date().toISOString();
    return new Product({
      id: props.id ?? `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      sku: props.sku.trim(),
      price: props.price,
      currency: props.currency,
      stock: props.stock,
      category: props.category.trim(),
      status: props.status ?? "draft",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): ProductProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      sku: this.sku,
      price: this.price,
      currency: this.currency,
      stock: this.stock,
      category: this.category,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
