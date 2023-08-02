import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierProductVariant1690974040177 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "supplier_product_variant" (
        "id" character varying NOT NULL,
        "supplier_product_id" character varying NOT NULL,
        "reference" VARCHAR,
        "supplierId" VARCHAR,
        "ean" VARCHAR,
        "sku" VARCHAR,
        "price" DECIMAL,
        "productName" VARCHAR,
        "quantity" INT,
        "weight" DECIMAL,
        "category" VARCHAR,
        "brand" VARCHAR,
        "imageUrl" VARCHAR,
        "expiryDate" VARCHAR,
        "promo" DECIMAL,
        "wholeSalePriceWithYourDiscount" DECIMAL,
        "wholeSalePrice" DECIMAL,
        "rpr" DECIMAL,
        "mainProductName" VARCHAR,
        "variantName" VARCHAR, 
        "isVariant" BOOLEAN NOT NULL DEFAULT false,
        "isCreatedInStore" BOOLEAN NOT NULL DEFAULT false,
        "hasVariants" BOOLEAN NOT NULL DEFAULT false,
        "parentId" VARCHAR, 
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      
        -- Add foreign key constraint to "supplier_product" table
        CONSTRAINT fk_supplier_product
          FOREIGN KEY ("supplier_product_id")
          REFERENCES "supplier_product" ("id")
          ON DELETE CASCADE -- or use another action if necessary
      );
      
      -- Add an index for faster lookup
      CREATE INDEX idx_supplier_product_variant_supplier_product_id
        ON "supplier_product_variant" ("supplier_product_id");`
    );
    await queryRunner.createPrimaryKey("supplier_product_variant", ["id"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("supplier_product_variant", true);
  }
}
