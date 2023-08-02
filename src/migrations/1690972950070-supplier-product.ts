import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierProduct1690972950070 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      ALTER TABLE IF EXISTS "supplier_product_variant"
      DROP CONSTRAINT IF EXISTS "fk_supplier_product_id";
      
      DROP TABLE IF EXISTS "supplier_product_variant";
      
      DROP TABLE IF EXISTS "supplier_product" CASCADE; 
      
      CREATE TABLE IF NOT EXISTS "supplier_product" (
          "id" character varying NOT NULL,
          "reference" VARCHAR,
          "supplierId" VARCHAR,
          "productName" VARCHAR,
          "sku" VARCHAR,
          "category" VARCHAR,
          "brand" VARCHAR,
          "mainProductName" VARCHAR,
          "isVariant" BOOLEAN NOT NULL DEFAULT false, 
          "hasVariants" BOOLEAN NOT NULL DEFAULT false,
          "parentId" VARCHAR, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()    
      );
	  
	  ALTER TABLE IF EXISTS "supplier_product_variant"
      ADD CONSTRAINT "fk_supplier_product_id"
      FOREIGN KEY ("supplierProductId") REFERENCES "supplier_product" ("id") ON DELETE CASCADE;
      `
    );
    await queryRunner.createPrimaryKey("supplier_product", ["id"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("supplier_product", true);
  }
}
