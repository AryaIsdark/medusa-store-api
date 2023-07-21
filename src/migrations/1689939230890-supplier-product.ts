import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierProduct1689939230890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "supplier_product" (
          "id" character varying NOT NULL,
          "reference" VARCHAR,
          "supplierId" VARCHAR,
          "ean" VARCHAR,
          "price" DECIMAL,
          "productName" VARCHAR,
          "quantity" INT,
          "weight" DECIMAL,
          "category" VARCHAR,
          "brand" VARCHAR,
          "productImages" VARCHAR,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
          );`
    );
    await queryRunner.createPrimaryKey("supplier_product", ["id"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("supplier_product", true);
  }
}
