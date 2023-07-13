import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
export class Supplier extends BaseEntity {
  @Column({ type: "varchar", nullable: true })
  brand: string;

  @Column({ type: "varchar", nullable: true })
  product: string;

  @Column({ type: "decimal", nullable: true })
  rpr: number;

  @Column({ type: "decimal", nullable: true })
  wholeSalePriceWithYourDiscount: number;

  @Column({ type: "decimal", nullable: true })
  wholeSalePrice: number;

  @Column({ type: "decimal", nullable: true })
  promo: number;

  @Column({ type: "decimal", nullable: true })
  megaDealPrice: number;

  @Column({ type: "decimal", nullable: true })
  weight: number;

  @Column({ type: "varchar", nullable: true })
  sku: string;

  @Column({ type: "varchar", nullable: true })
  ean: string;

  @Column({ type: "varchar", nullable: true })
  expiryDate: string;

  @Column({ type: "varchar", nullable: true })
  countryOfOrigin: string;

  @Column({ type: "varchar", nullable: true })
  productUrl: string;

  @Column({ type: "varchar", nullable: true })
  imageUrl: string;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "supplier");
  }
}
