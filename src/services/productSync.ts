import {
  ProductService,
  ProductVariant,
  ProductVariantService,
  TransactionBaseService,
  Product,
} from "@medusajs/medusa";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { CreateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant";

class ProductSyncService extends TransactionBaseService {
  productService: ProductService;
  productVariantService: ProductVariantService;

  constructor(container) {
    super(container);
    // Services
    this.productService = container.productService;
    this.productVariantService = container.productVariantService;
  }

  private prepareVariantDTO = (product: Product, variant: any) => {
    const variantOptions = product.options.map((v) => ({
      option_id: v.id,
      value: variant.attributeGroup ?? variant.productName,
    }));

    return {
      title: variant.productName,
      sku: variant.combinationReference ?? variant.reference,
      barcode: variant.combinationEan13 || variant.ean13,
      ean: variant.combinationEan13 || variant.ean13,
      upc: variant.combinationEan13 || variant.ean13,
      inventory_quantity: 100,
      options: variantOptions,
      prices: [],
    };
  };

  public rollbackProduct = async (productId: string) => {
    console.log("rollbackProduct - productId:", productId);
    const product = await this.productService.retrieve_(productId);
    console.log(product);
    const productVariants = await this.productService.retrieveVariants(
      productId
    );

    // Delete Product Options
    for (const option of product.options) {
      await this.productService.deleteOption(productId, option.id);
    }

    // Delete Product Variants
    await this.productVariantService.delete(
      productVariants.map((variant) => variant.id)
    );

    // Delete Product
    await this.productService.delete(productId);
  };

  public createProductAndVariants = async (
    product: CreateProductInput,
    productVariants: any
  ) => {
    try {
      const newProduct: Product = await this.productService.create(product);
      if (newProduct.id) {
        const productVariantsDTO: CreateProductVariantInput[] = [];
        for (const v of productVariants) {
          productVariantsDTO.push(this.prepareVariantDTO(newProduct, v));
        }

        try {
          await this.productVariantService.create(
            newProduct.id,
            productVariantsDTO
          );
        } catch (error) {
          const test = {
            productId: newProduct.id,
            message: error,
          };
          console.log(
            "Error while creating Variants for product with id:",
            newProduct.id
          );
          throw test;
        }
      }
    } catch (error) {
      console.log("createProductAndVariants Error", error);
      throw error;
    }
  };
}

export default ProductSyncService;
