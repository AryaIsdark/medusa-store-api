import { MigrationInterface, QueryRunner } from "typeorm";

export class Supplier1689503947191 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "supplier"; 
       CREATE TABLE IF NOT EXISTS "supplier" (
                  "id" character varying NOT NULL,
                  "reference" VARCHAR NULL,
                  "combinationReference" VARCHAR NULL,
                  "ean13" VARCHAR NULL,
                  "combinationEan13" VARCHAR NULL,
                  "combinationPrice" DECIMAL NULL,
                  "price" DECIMAL NULL,
                  "productName" VARCHAR NULL,
                  "attributeGroup" VARCHAR NULL,
                  "costPrice" DECIMAL NULL,
                  "combinationCostPrice" DECIMAL NULL,
                  "quantity" INT NULL,
                  "weight" DECIMAL NULL,
                  "product_type" VARCHAR NULL,
                  "category" VARCHAR NULL,
                  "brand" VARCHAR NULL,
                  "supplier" VARCHAR NULL,
                  "productImages" VARCHAR NULL,
                  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
                )`
    );
    await queryRunner.createPrimaryKey("supplier", ["id"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("supplier", true);
  }
}
