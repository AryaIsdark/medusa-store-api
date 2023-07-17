import { CreateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import {
  ProductStatus,
  ProductVariant,
  MoneyAmount,
  ProductVariantService,
  ProductService,
} from "@medusajs/medusa";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const groupProductsByReference = (products) => {
  let groupedProducts = [];
  const visitedIds = new Set();

  products.forEach((product) => {
    const variants = products.filter((p) => {
      if (!visitedIds.has(p.id) && p.reference === product.reference) {
        return p;
      }
    });

    groupedProducts.push({
      id: product.id,
      numberOfVariants: variants.length,
      variants,
    });

    variants.forEach((variant) => {
      visitedIds.add(variant.id);
    });
  });

  return groupedProducts.filter((product) => !!product.variants.length);
};

export const getImages = (variants) =>
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

export const prepareProductVarianObj = (
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

export const prepareProductObj = (
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

export const uploadImages = async (images) => {
  const uploads = await Promise.all(
    images.map((image) => cloudinary.v2.uploader.upload(image))
  );

  return uploads.map((u) => u.secure_url);
};