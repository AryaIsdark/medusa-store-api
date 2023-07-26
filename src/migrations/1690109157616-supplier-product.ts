import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierProduct1690109157616 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public.product_option_value;
      DELETE FROM public.product_option;
      DELETE FROM public.line_item_tax_line;
      DELETE FROM public.line_item;
      DELETE FROM public.product_variant;
      DELETE FROM public.product;
      DROP TABLE IF EXISTS "supplier_product";
      CREATE TABLE IF NOT EXISTS "supplier_product" (
        "id" character varying NOT NULL,
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
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )`
    );
    await queryRunner.createPrimaryKey("supplier_product", ["id"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("supplier_product", true);
  }
}
