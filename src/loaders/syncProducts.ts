import { AwilixContainer } from "awilix";
import {
  getImages,
  groupProductsByReference,
  prepareProductObj,
  prepareProductVarianObj,
  uploadImages,
} from "../api/routes/admin/products/helpers/helpers";

const syncProductsJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create("sync-products", {}, "* * * * *", async () => {
    // job to execute
    const supplierService = container.resolve("supplierService");
    const productService = container.resolve("productService");
    const productVariantService = container.resolve("productVariantService");
    const shippingProfileService = container.resolve("shippingProfileService");
    const salesChannelService = container.resolve("salesChannelService");
    const regionService = container.resolve("regionService");

    const defaulShippingProfilePromise =
      shippingProfileService.retrieveDefault();
    const defaultSalesChannelPromise = salesChannelService.retrieveDefault();
    const regionsPromise = regionService.list();
    const supplierProductsPromise = supplierService.list();

    const [
      defaulShippingProfile,
      defaultSalesChannel,
      regions,
      supplierProducts,
    ] = await Promise.all([
      defaulShippingProfilePromise,
      defaultSalesChannelPromise,
      regionsPromise,
      supplierProductsPromise,
    ]);

    const createProductAndVariants = async (productVariants, imageUrls) => {
      try {
        if (productVariants.length) {
          const baseProduct = productVariants[0];

          const newProduct = await productService.create(
            prepareProductObj(
              baseProduct,
              imageUrls,
              defaulShippingProfile,
              defaultSalesChannel
            )
          );

          if (newProduct.id) {
            await Promise.all(
              productVariants.map(async (variant) => {
                const variantOptions = newProduct.options.map((v) => ({
                  option_id: v.id,
                  value: variant.attributeGroup ?? variant.productName,
                }));

                await productVariantService.create(
                  newProduct.id,
                  prepareProductVarianObj(
                    variant,
                    newProduct,
                    regions,
                    variantOptions
                  )
                );
              })
            );
          }
        }
      } catch (error) {
        // Handle the error gracefully here, you can log it or perform any other necessary actions.
        console.error("An unexpected error occurred:", error);
      }
    };

    const grouppedProducts = groupProductsByReference(supplierProducts);

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
          const productImageUrlsTobeUploaded = getImages(productVariants);
          const imageUrls = await uploadImages(productImageUrlsTobeUploaded);
          await createProductAndVariants(productVariants, imageUrls);
        })
      );

      processedProducts += batch.length;
    }
  });
};

export default syncProductsJob;
