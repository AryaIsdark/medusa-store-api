import {
  TransactionBaseService,
  ProductVariantService,
  ProductService,
  ShippingProfileService,
  SalesChannelService,
  ProductVariant,
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

  async mapVariants() {
    const products = await this.productVariantService.list({});
    console.log("products", products);
    const supplierProducts = await this.supplierProductService.list();
    for (const supplierProduct of supplierProducts) {
      const variant = await this.productVariantService.retrieveBySKU(
        supplierProduct.sku
      );

      const parentId: string = variant.metadata.parentId as unknown as string;

      console.log("variant", variant);
      if (parentId) {
        const variants = await this.supplierProductService.findByParentId(
          parentId
        );
      }
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

  private async addNewProductWithVariants(supplierProducts: SupplierProduct[]) {
    const [defaulShippingProfile, defaultSalesChannel] = await Promise.all([
      this.defaulShippingProfilePromise,
      this.defaultSalesChannelPromise,
    ]);

    if (supplierProducts.length) {
      const baseProduct = supplierProducts[0];
      try {
        const newProduct = await this.productService.create(
          prepareProductObj(
            baseProduct,
            [],
            defaulShippingProfile,
            defaultSalesChannel
          )
        );
        console.log("new product added", newProduct);
        if (newProduct.id) {
          await Promise.all(
            supplierProducts.map(async (supplierProduct) => {
              const variantOptions = newProduct.options.map((v) => ({
                option_id: v.id,
                value: supplierProduct.productName,
              }));

              console.log("variant options", variantOptions);
              try {
                const newVariant: ProductVariant =
                  await this.productVariantService.create(
                    newProduct.id,
                    prepareProductVarianObj(supplierProduct, variantOptions)
                  );

                console.log("newVariant", newVariant);
                if (newVariant.id) {
                  try {
                    console.log("I was called ");
                    await this.supplierProductService.update(
                      supplierProduct.id,
                      {
                        isCreatedInStore: true,
                      }
                    );
                  } catch (e) {
                    console.log(
                      "something went wrong when trying to update supplier product with id:",
                      supplierProduct.id,
                      e
                    );
                  }
                }
              } catch (e) {
                console.log(
                  `something went wrong when trying to create variant ${supplierProduct.reference} - ${supplierProduct.productName}`,
                  e
                );
              }
            })
          );
        }
      } catch (e) {
        console.log(
          `something went wrong when trying to create product ${baseProduct.sku} - ${baseProduct.productName}`,
          e
        );
      }
    }
  }

  async beginSync() {
    const supplierProducts = await this.supplierProductService.search({
      isCreatedInStore: false,
    });

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
          // const productImageUrlsTobeUploaded = getImages(productVariants);
          // const imageUrls = await uploadImages(productImageUrlsTobeUploaded);
          await this.addNewProductWithVariants(productVariants);
        })
      );

      processedProducts += batch.length;
    }
  }
}

export default SyncProductsService;
