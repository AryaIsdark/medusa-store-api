import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
export class Supplier extends BaseEntity {
  @Column({ type: "varchar", nullable: true })
  reference: string;

  @Column({ type: "varchar", nullable: true })
  combinationReference: string;

  @Column({ type: "varchar", nullable: true })
  ean13: string;

  @Column({ type: "varchar", nullable: true })
  combinationEan13: string;

  @Column({ type: "decimal", nullable: true })
  combinationPrice: number;

  @Column({ type: "decimal", nullable: true })
  price: number;

  @Column({ type: "varchar", nullable: true })
  productName: string;

  @Column({ type: "varchar", nullable: true })
  attributeGroup: string;

  @Column({ type: "decimal", nullable: true })
  costPrice: number;

  @Column({ type: "decimal", nullable: true })
  combinationCostPrice: number;

  @Column({ type: "int", nullable: true })
  quantity: number;

  @Column({ type: "decimal", nullable: true })
  weight: number;

  @Column({ type: "varchar", nullable: true })
  product_type: string;

  @Column({ type: "varchar", nullable: true })
  category: string;

  @Column({ type: "varchar", nullable: true })
  brand: string;

  @Column({ type: "varchar", nullable: true })
  supplier: string;

  @Column({ type: "varchar", nullable: true })
  productImages: string;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "supplier");
  }
}
