import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";
import { SupplierProductVariant } from "./supplier-product-variant";

@Entity()
export class SupplierProduct extends BaseEntity {
  @Column({ type: "varchar", nullable: true })
  reference: string;

  @Column({ type: "varchar", nullable: true })
  supplierId: string;

  @Column({ type: "varchar", nullable: true })
  sku: string;

  @Column({ type: "varchar", nullable: true })
  productName: string;

  @Column({ type: "varchar", nullable: true })
  category: string;

  @Column({ type: "varchar", nullable: true })
  brand: string;

  @Column({ type: "varchar", nullable: true })
  mainProductName: string;

  @Column({ type: "boolean", default: false })
  isVariant: boolean;

  @Column({ type: "boolean", default: false })
  hasVariants: boolean;

  @Column({ type: "varchar", nullable: true })
  parentId: string;

  @OneToMany(() => SupplierProductVariant, (variant) => variant.supplierProduct)
  variants: SupplierProductVariant[];

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "supplier_product");
  }
}
