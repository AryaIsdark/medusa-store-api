import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
export class SupplierProduct extends BaseEntity {
  @Column({ type: "varchar", nullable: true })
  reference: string;

  @Column({ type: "varchar", nullable: true })
  supplierId: string;

  @Column({ type: "varchar", nullable: true })
  ean: string;

  @Column({ type: "varchar", nullable: true })
  sku: string;

  @Column({ type: "decimal", nullable: true })
  price: number;

  @Column({ type: "varchar", nullable: true })
  productName: string;

  @Column({ type: "int", nullable: true })
  quantity: number;

  @Column({ type: "decimal", nullable: true })
  weight: number;

  @Column({ type: "varchar", nullable: true })
  category: string;

  @Column({ type: "varchar", nullable: true })
  brand: string;

  @Column({ type: "varchar", nullable: true })
  imageUrl: string;

  @Column({ type: "varchar", nullable: true })
  expiryDate: string;

  @Column({ type: "decimal", nullable: true })
  promo: number;

  @Column({ type: "decimal", nullable: true })
  wholeSalePriceWithYourDiscount: number;

  @Column({ type: "decimal", nullable: true })
  wholeSalePrice: number;

  @Column({ type: "decimal", nullable: true })
  rpr: number;

  @Column({ type: "varchar", nullable: true })
  mainProductName: string;

  @Column({ type: "varchar", nullable: true })
  variantName: string;

  @Column({ type: "boolean", default: false })
  isVariant: boolean;

  @Column({ type: "boolean", default: false })
  hasVariants: boolean;

  @Column({ type: "varchar", nullable: true })
  parentId: string;

  @Column({ type: "boolean", nullable: false })
  isCreatedInStore: boolean;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "supplier_product");
  }
}
