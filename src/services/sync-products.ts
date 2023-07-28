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
import { UpdateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant";
import {
  UpdateProductInput,
  FindProductConfig,
} from "@medusajs/medusa/dist/types/product";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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
        try {
          await this.createVariantsForProduct(
            existingProducts[0],
            supplierProducts
          );
          return;
        } catch (e) {
          console.log(
            "something went wrong when trying to create variants for existing products",
            e
          );
        }
      }

      const newProduct = await this.createProduct(baseProduct);
      const variants = supplierProducts.filter(
        (item) => item.isCreatedInStore === false
      );
      try {
        if (newProduct.id && variants.length) {
          await this.createVariantsForProduct(newProduct, variants);
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

  async updateExistingProducts(supplierProducts: SupplierProduct[]) {
    await Promise.all(
      supplierProducts.map(async (supplierProduct) => {
        console.log("I was ran for product:", supplierProduct.sku);
        const variants: ProductVariant[] =
          await this.productVariantService.list({
            sku: supplierProduct.sku,
          });
        if (variants[0].id) {
          try {
            const updateData: UpdateProductVariantInput = {
              inventory_quantity: supplierProduct.quantity,
            };
            const variantData = { variant: variants[0], updateData };
            await this.productVariantService.update([variantData]);
          } catch (e) {
            console.log(
              `something went wrong while updating ${variants[0].sku} - ${variants[0].title}`,
              e
            );
          }
        }
      })
    );
  }

  async findParentProductByVariant(productVariant: ProductVariant) {
    const config: FindProductConfig = {
      relations: ["image"],
    };
    return await this.productService.retrieve(productVariant.product_id);
  }

  async findRelatedProductVariantBySupplierProduct(supplierProduct) {
    const variants: ProductVariant[] = await this.productVariantService.list({
      sku: supplierProduct.sku,
    });
    return variants[0];
  }

  async updateProductVariant(
    variant: ProductVariant,
    updateData: UpdateProductVariantInput
  ) {
    try {
      const variantData = { variant, updateData };
      await this.productVariantService.update([variantData]);
    } catch (e) {
      console.log(
        `something went wrong when trying to update variant: ${variant.id}`,
        e
      );
    }
  }

  async upateProductVariantImages(uploadResults) {
    Promise.all(
      uploadResults.map(async (uploadResult) => {
        const supplierProduct = uploadResult.supplierProduct;
        const imageUrl = uploadResult.image.secure_url;
        const productVariant =
          await this.findRelatedProductVariantBySupplierProduct(
            supplierProduct
          );
        console.log(productVariant);
        const existingImages: string[] = productVariant.metadata
          ?.syncedImages as string[];
        await this.updateProductVariant(productVariant, {
          metadata: { syncedImages: [...existingImages, imageUrl] },
        });
      })
    );
  }

  async uploadImages(supplierProducts) {
    const uploadResults = [];
    await Promise.all(
      supplierProducts.map((supplierProduct) => {
        const imageUrl = supplierProduct.imageUrl;
        cloudinary.v2.uploader
          .upload(imageUrl, {
            public_id: `medusa/${supplierProduct.sku}/${supplierProduct.ean}`,
            overwrite: false,
          })
          .catch((e) => {
            throw e;
          })
          .then((image) => {
            console.log(image);
            uploadResults.push({ supplierProduct, image });
          });
      })
    );

    return uploadResults;
  }

  async getProductVariantImage(productVariant: ProductVariant) {
    const public_id = `medusa/${productVariant.sku}/${productVariant.ean}`;
    return await cloudinary.v2.api.resource(public_id);
  }

  async beginSyncImages() {
    const productVariants: ProductVariant[] =
      await this.productVariantService.list({});
    Promise.all(
      productVariants.map(async (productVariant) => {
        const image = await this.getProductVariantImage(productVariant);
        console.log(image);
        if (image) {
          await this.updateProductVariant(productVariant, {
            metadata: { storeImages: [image] },
          });
          const parentProduct = await this.findParentProductByVariant(
            productVariant
          );
          console.log(parentProduct.images);
          if (parentProduct) {
            const data: UpdateProductInput = {
              images: [image.secure_url],
            };
            await this.productService.update(parentProduct.id, data);
          }
        }
      })
    );
  }

  async beginSyncUploadImages() {
    // await cloudinary.v2.api.delete_all_resources();
    const supplierProducts = await this.supplierProductService.list();
    try {
      const uploadResult = await this.uploadImages(supplierProducts);
      if (uploadResult.length) {
        await this.upateProductVariantImages(uploadResult);
      }
    } catch (e) {
      console.log("something went wrong when trying to upload image", e);
    }
  }

  async beginUpdateSync() {
    const supplierProducts = await this.supplierProductService.search({
      isCreatedInStore: true,
    });

    if (supplierProducts.length) {
      try {
        await this.updateExistingProducts(supplierProducts);
      } catch (e) {
        console.log("something went wrong while updating products", e);
      }
    }
  }

  async beginCreateSync() {
    const newSupplierProducts = await this.supplierProductService.list();
    const hasNewProducts = newSupplierProducts.some(
      (item) => item.isCreatedInStore === false
    );

    if (hasNewProducts) {
      const grouppedProducts =
        this.groupProductsByParentId(newSupplierProducts);

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
            try {
              const productVariants = product.variants;
              await this.createOrUpdateProductWithVariants(productVariants);
            } catch (e) {
              console.log("an error occured while processing syncing", e);
            }
          })
        );

        processedProducts += batch.length;
      }
    }
  }
}

export default SyncProductsService;
