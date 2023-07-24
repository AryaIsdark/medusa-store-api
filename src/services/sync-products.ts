import {
  TransactionBaseService,
  ProductVariantService,
  ProductService,
  ShippingProfileService,
  SalesChannelService,
  ProductVariant,
  Product,
} from "@medusajs/medusa";
import SupplierProductService from "./supplier-product";
import { SupplierProduct } from "models/supplier-product";
import {
  prepareProductObj,
  prepareProductVarianObj,
} from "../api/routes/admin/products/helpers/helpers";

class SyncProductsService extends TransactionBaseService {
  private supplierProductService: SupplierProductService;
  private productService: ProductService;
  private productVariantService: ProductVariantService;
  private shippingProfileService: ShippingProfileService;
  private salesChannelService: SalesChannelService;

  private defaulShippingProfilePromise;
  private defaultSalesChannelPromise;

  constructor(container) {
    super(container);
    // Services
    this.supplierProductService = container.supplierProductService;
    this.productService = container.productService;
    this.productVariantService = container.productVariantService;
    this.shippingProfileService = container.shippingProfileService;
    this.salesChannelService = container.salesChannelService;

    this.defaulShippingProfilePromise =
      this.shippingProfileService.retrieveDefault();
    this.defaultSalesChannelPromise =
      this.salesChannelService.retrieveDefault();
  }

  private async updateSupplierProduct(supplierProduct: SupplierProduct) {
    try {
      await this.supplierProductService.update(supplierProduct.id, {
        isCreatedInStore: true,
      });
    } catch (e) {
      console.log(
        "something went wrong when trying to update supplier product with id:",
        supplierProduct.id,
        e
      );
    }
  }

  groupProductsByParentId(list) {
    const groupedProducts = list.reduce((acc, obj) => {
      const parentId = obj.parentId;
      // Check if a product with the same parentId exists in the accumulator
      const existingProduct = acc.find(
        (item) => item.productParentId === parentId
      );

      if (existingProduct) {
        existingProduct.variants.push(obj);
      } else {
        acc.push({
          productParentId: parentId,
          variants: [obj],
        });
      }
      return acc;
    }, []);

    return groupedProducts;
  }

  private async createProduct(baseProduct: SupplierProduct) {
    const [defaulShippingProfile, defaultSalesChannel] = await Promise.all([
      this.defaulShippingProfilePromise,
      this.defaultSalesChannelPromise,
    ]);

    return this.productService.create(
      prepareProductObj(
        baseProduct,
        [],
        defaulShippingProfile,
        defaultSalesChannel
      )
    );
  }

  private async createOrUpdateProductWithVariants(
    supplierProducts: SupplierProduct[]
  ) {
    if (supplierProducts.length) {
      const baseProduct = supplierProducts[0];
      const existingProducts: Product[] = await this.productService.list({
        q: baseProduct.sku,
      });

      if (existingProducts[0] && existingProducts[0].id) {
        await this.createVariantsForProduct(
          existingProducts[0],
          supplierProducts
        );
        return;
      }

      const newProduct = await this.createProduct(baseProduct);
      try {
        if (newProduct.id) {
          await this.createVariantsForProduct(newProduct, supplierProducts);
        }
      } catch (e) {
        console.log(
          `something went wrong when trying to create product ${baseProduct.sku} - ${baseProduct.productName}`,
          e
        );
      }
    }
  }

  private async createVariantsForProduct(
    product: Product,
    supplierProducts: SupplierProduct[]
  ) {
    const productOption = await this.productService.retrieveOptionByTitle(
      "variation",
      product.id
    );

    await Promise.all(
      supplierProducts.map(async (supplierProduct) => {
        const variantOptions = [
          {
            option_id: productOption.id,
            value: supplierProduct.productName,
          },
        ];

        try {
          const newVariant: ProductVariant =
            await this.productVariantService.create(
              product.id,
              prepareProductVarianObj(supplierProduct, variantOptions)
            );
          if (newVariant.id) {
            await this.updateSupplierProduct(supplierProduct);
          }
        } catch (e) {
          console.log(
            `something went wrong when trying to create variant ${supplierProduct.sku} - ${supplierProduct.productName}`,
            e
          );
        }
      })
    );
  }

  async beginSync() {
    const supplierProducts = await this.supplierProductService.list();

    const grouppedProducts = this.groupProductsByParentId(supplierProducts);

    const batchSize = 1; // Set the desired batch size
    const totalProducts = grouppedProducts.length;
    let processedProducts = 0;

    while (processedProducts < totalProducts) {
      const batch = grouppedProducts.slice(
        processedProducts,
        processedProducts + batchSize
      );

      await Promise.all(
        batch.map(async (product) => {
          const productVariants = product.variants;
          await this.createOrUpdateProductWithVariants(productVariants);
        })
      );

      processedProducts += batch.length;
    }
  }
}

export default SyncProductsService;
