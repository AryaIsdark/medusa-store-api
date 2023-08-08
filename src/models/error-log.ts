import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
export class ErrorLog extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  entity_id: string;

  @Column({ type: "text", nullable: false })
  error: string;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "error_log");
  }
}
