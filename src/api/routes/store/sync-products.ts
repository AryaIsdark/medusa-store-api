import { Request, Response } from "express";

import {
  getImages,
  groupProductsByReference,
  prepareProductObj,
  prepareProductVarianObj,
  uploadImages,
} from "../admin/products/helpers/helpers";

export default async (req: Request, res: Response): Promise<void> => {
  const supplierService = req.scope.resolve("supplierService");
  const productService = req.scope.resolve("productService");
  const productVariantService = req.scope.resolve("productVariantService");
  const shippingProfileService = req.scope.resolve("shippingProfileService");
  const salesChannelService = req.scope.resolve("salesChannelService");
  const regionService = req.scope.resolve("regionService");

  const defaulShippingProfilePromise = shippingProfileService.retrieveDefault();
  const defaultSalesChannelPromise = salesChannelService.retrieveDefault();
  const regionsPromise = regionService.list();
  const supplierProductsPromise = supplierService.list();

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
  res.json({
    status: 200,
    count: grouppedProducts.length,
    data: grouppedProducts,
  });
};
