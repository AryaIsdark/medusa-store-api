import { MigrationInterface, QueryRunner } from "typeorm";

export class Supplier1689235663149 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "supplier" (
            "id" character varying NOT NULL,
            "brand" VARCHAR NULL,
            "product" VARCHAR NULL,
            "rpr" DECIMAL NULL,
            "wholeSalePriceWithYourDiscount" DECIMAL NULL,
            "wholeSalePrice" DECIMAL NULL,
            "promo" DECIMAL NULL,
            "megaDealPrice" DECIMAL NULL,
            "weight" DECIMAL NULL,
            "sku" VARCHAR NULL,
            "ean" VARCHAR NULL,
            "expiryDate" VARCHAR NULL,
            "countryOfOrigin" VARCHAR NULL,
            "productUrl" VARCHAR NULL,
            "imageUrl" VARCHAR NULL,
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
