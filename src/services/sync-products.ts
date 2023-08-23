import {
  TransactionBaseService,
  ProductVariantService,
  ProductService,
  ShippingProfileService,
  SalesChannelService,
  ProductVariant,
  Product,
  ProductStatus,
} from "@medusajs/medusa";
import SupplierProductService from "./supplier-product";
import { SupplierProduct } from "models/supplier-product";

import {
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from "@medusajs/medusa/dist/types/product-variant";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import {
  UpdateProductInput,
  FindProductConfig,
} from "@medusajs/medusa/dist/types/product";

import SupplierProductVariantService from "./supplier-product-variant";
import { SupplierProductVariant } from "models/supplier-product-variant";
import { exchangeRates } from "../helpers/price-helpers";
import ErrorLogService from "./error-log";

class SyncProductsService extends TransactionBaseService {
  private errorLogService: ErrorLogService;
  private supplierProductService: SupplierProductService;
  private supplierProductVariantService: SupplierProductVariantService;
  private productService: ProductService;
  private productVariantService: ProductVariantService;
  private shippingProfileService: ShippingProfileService;
  private salesChannelService: SalesChannelService;

  private defaulShippingProfilePromise;
  private defaultSalesChannelPromise;

  constructor(container) {
    super(container);
    // Services
    this.errorLogService = container.errorLogService;
    this.supplierProductService = container.supplierProductService;
    this.supplierProductVariantService =
      container.supplierProductVariantService;
    this.productService = container.productService;
    this.productVariantService = container.productVariantService;
    this.shippingProfileService = container.shippingProfileService;
    this.salesChannelService = container.salesChannelService;

    this.defaulShippingProfilePromise =
      this.shippingProfileService.retrieveDefault();
    this.defaultSalesChannelPromise =
      this.salesChannelService.retrieveDefault();
  }

  async logError(entity_id, error) {
    return await this.errorLogService.create({
      entity_id: entity_id,
      error: JSON.stringify(error),
    });
  }

  getPrices(price_in_euro: number) {
    const eur_to_sek_rate = exchangeRates.eur_to_sek * 100; // Medusa works with cents
    const price_in_sek = price_in_euro * eur_to_sek_rate;
    return [
      {
        currency_code: "sek",
        amount: Math.round(price_in_sek), // Round to the nearest integer (cents)
      },
    ];
  }

  getProductImages(variants: SupplierProductVariant[]) {
    return variants.map((variant) => variant.imageUrl);
  }

  async getParentProduct(
    supplierProductVariant: SupplierProductVariant
  ): Promise<Product> {
    try {
      return await this.productService.retrieveByExternalId(
        supplierProductVariant.supplier_product_id
      );
    } catch (e) {
      // await this.logError(supplierProductVariant.id, e);
    }
  }

  async getVariantOptions(product: Product, productName: string) {
    const productOption = await this.productService.retrieveOptionByTitle(
      "variation",
      product.id
    );
    if (productOption) {
      const variantOptions = [
        {
          option_id: productOption.id,
          value: productName,
        },
      ];

      return variantOptions;
    }

    return null;
  }

  async updateExistingVariant(
    productVariant: ProductVariant,
    data: SupplierProductVariant
  ) {
    const updateInput: UpdateProductVariantInput = {
      prices: this.getPrices(data.wholeSalePrice),
      inventory_quantity: data.quantity,
    };
    await this.productVariantService.update(productVariant.id, updateInput);
  }

  async updateExistingProduct(product: Product, data: SupplierProduct) {
    const updateInput: UpdateProductInput = {
      title: data.productName,
    };
    try {
      await this.productService.update(product.id, updateInput);
    } catch (e) {
      this.logError(product.id, e);
    }
  }

  async createNewProductVariant(data: SupplierProductVariant) {
    const parentProduct = await this.getParentProduct(data);
    if (parentProduct?.id) {
      const variantOptions = await this.getVariantOptions(
        parentProduct,
        data.productName
      );

      if (variantOptions.length) {
        const variant: CreateProductVariantInput = {
          title: data.productName,
          sku: data.sku,
          barcode: data.ean,
          ean: data.ean,
          upc: data.ean,
          inventory_quantity: data.quantity ?? 0,
          options: variantOptions,
          metadata: { parentId: data.parentId },
          prices: this.getPrices(data.wholeSalePrice),
        };
        try {
          await this.productVariantService.create(parentProduct.id, variant);
        } catch (e) {
          this.logError(data.id, e);
        }
      }
    }
  }

  async createNewProduct(
    data: SupplierProduct,
    shippingProfile,
    salesChannels,
    variants: SupplierProductVariant[]
  ) {
    const product: CreateProductInput = {
      title: data.productName,
      subtitle: data.brand,
      description: "This is a very good product, buy it...",
      status: ProductStatus.DRAFT,
      profile_id: shippingProfile.id,
      sales_channels: salesChannels,
      options: [{ title: "variation" }],
      images: this.getProductImages(variants),
      external_id: data.id,
    };
    try {
      await this.productService.create(product);
    } catch (e) {
      await this.logError(data.id, e);
    }
  }

  async findOneProductVariantBySupplierProduct(
    supplierProductVariant: SupplierProductVariant
  ): Promise<ProductVariant> {
    try {
      return await this.productVariantService.retrieveBySKU(
        supplierProductVariant.sku
      );
    } catch (e) {
      // await this.logError(supplierProductVariant.id, e);
    }
  }

  async findOneProductBySupplierProduct(
    supplierProduct: SupplierProduct
  ): Promise<Product> {
    try {
      return await this.productService.retrieveByExternalId(supplierProduct.id);
    } catch (e) {
      // await this.logError(supplierProduct.id, e);
    }
  }

  async syncProductVariants(variants: SupplierProductVariant[]) {
    for (const variant of variants) {
      // check if variant is already existing in product-variant table
      const productVariant = await this.findOneProductVariantBySupplierProduct(
        variant
      );

      if (productVariant?.id) {
        // Update variant
        await this.updateExistingVariant(productVariant, variant);
      }

      if (!productVariant?.id) {
        // create variant
        await this.createNewProductVariant(variant);
      }
    }
  }

  async syncProducts(supplierProducts: SupplierProduct[]) {
    const [defaulShippingProfile, defaultSalesChannel] = await Promise.all([
      this.defaulShippingProfilePromise,
      this.defaultSalesChannelPromise,
    ]);

    for (const supplierProduct of supplierProducts) {
      // check if a corresponding product exists in products table
      const product = await this.findOneProductBySupplierProduct(
        supplierProduct
      );

      const variants = await this.supplierProductVariantService.search({
        supplier_product_id: supplierProduct.id,
      });

      // if product exists
      if (product?.id) {
        // update Product
        await this.updateExistingProduct(product, supplierProduct);
      }

      // if product does not exits
      if (!product?.id) {
        await this.createNewProduct(
          supplierProduct,
          defaulShippingProfile,
          [defaultSalesChannel],
          variants
        );
      }
    }
  }

  async syncProductsAndVariants() {
    
    const supplierProducts = await this.supplierProductService.list();
    
    const supplierProductVariants =
      await this.supplierProductVariantService.list();
    await this.syncProducts(supplierProducts);
    await this.syncProductVariants(supplierProductVariants);
  }
}

export default SyncProductsService;
