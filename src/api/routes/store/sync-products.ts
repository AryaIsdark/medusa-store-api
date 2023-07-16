import { Request, Response } from "express";
import {
  ProductStatus,
  ProductVariant,
  MoneyAmount,
  ProductVariantService,
  ProductService,
} from "@medusajs/medusa";
import cloudinary from "cloudinary";
import { CreateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function groupProductsByReference(products) {
  let groupedProducts = {};
  const visitedIds = new Set();

  products.forEach((product) => {
    const variants = products.filter((p) => {
      if (!visitedIds.has(p.id) && p.reference === product.reference) {
        return p;
      }
    });
    groupedProducts = {
      ...groupedProducts,
      [product.id]: {
        variants: variants,
      },
    };

    variants.forEach((variant) => {
      visitedIds.add(variant.id);
    });
  });

  return groupedProducts;
}

const prepareProductVarianObj = (
  obj: any,
  product: any,
  regions: any,
  variantOptions: any
): CreateProductVariantInput => {
  return {
    title: obj.productName,
    sku: obj.combinationReference ?? obj.reference,
    barcode: obj.combinationEan13 ?? obj.ean13,
    ean: obj.combinationEan13 ?? obj.ean13,
    upc: obj.combinationEan13 ?? obj.ean13,
    inventory_quantity: 100,
    options: variantOptions,
    prices: [],
  };
};

const getImages = (variants) =>
  variants.flatMap((v) => {
    if (v.productImages) {
      const delimiter = ";";
      if (v.productImages.includes(delimiter)) {
        return v.productImages.split(delimiter);
      } else {
        return [v.productImages];
      }
    }
    return [];
  });

const prepareProductObj = (
  obj,
  productImages,
  defaulShippingProfile,
  defaultSalesChannel
): CreateProductInput => ({
  title: obj.productName,
  subtitle: obj.brand,
  description: "This is a very good product, buy it...",
  status: ProductStatus.DRAFT,
  profile_id: defaulShippingProfile.id,
  sales_channels: [defaultSalesChannel],
  options: [{ title: "variation" }],
  images: productImages,
});

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

  const uploadImages = async (images) => {
    const uploads = await Promise.all(
      images.map((image) => cloudinary.v2.uploader.upload(image))
    );

    return uploads.map((u) => u.secure_url);
  };

  const createProductAndVariants = async (productVariants, imageUrls) => {
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

  const batchSize = 10; // Set the desired batch size
  const totalProducts = supplierProducts.length;
  let processedProducts = 0;

  while (processedProducts < totalProducts) {
    const batchProducts = supplierProducts.slice(
      processedProducts,
      processedProducts + batchSize
    );

    const grouppedProducts = groupProductsByReference(batchProducts);

    await Promise.all(
      Object.keys(grouppedProducts).map(async (supplierProduct) => {
        const productVariants = grouppedProducts[supplierProduct].variants;
        const productImageUrlsTobeUploaded = getImages(productVariants);
        const imageUrls = await uploadImages(productImageUrlsTobeUploaded);
        await createProductAndVariants(productVariants, imageUrls);
      })
    );

    processedProducts += batchProducts.length;
  }

  res.json({
    status: 200,
    data: "Products created successfully",
  });
};
