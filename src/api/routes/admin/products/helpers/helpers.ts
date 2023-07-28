import {
  CreateProductVariantInput,
  ProductVariantPrice,
} from "@medusajs/medusa/dist/types/product-variant";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { ProductStatus, Region } from "@medusajs/medusa";
import cloudinary from "cloudinary";
import { SupplierProduct } from "models/supplier-product";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const exchangeRates = {
  eur_to_sek: 11.52,
};

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

const roundToNearestRoundValue = (price: number) => {
  console.log("price", price);
  const nonDecimalPart = Math.ceil(price);
  const decimalPart = 0.9;
  const roundedValue = nonDecimalPart + decimalPart;
  return roundedValue;
};

const trimDecimals = (price: number) => parseFloat(price.toFixed(2));

export const getPrices = (price_in_euro: number): ProductVariantPrice[] => {
  // 10.53
  const eur_to_sek_rate = exchangeRates.eur_to_sek; // Medusa works with cents
  const price_in_sek =
    roundToNearestRoundValue(trimDecimals(price_in_euro * eur_to_sek_rate)) *
    100;
  return [
    {
      currency_code: "sek",
      amount: 100,
    },
  ];
};

export const prepareProductVarianObj = (
  obj: SupplierProduct,
  variantOptions: any
): CreateProductVariantInput => {
  return {
    title: obj.productName,
    sku: obj.sku,
    barcode: obj.ean,
    ean: obj.ean,
    upc: obj.ean,
    inventory_quantity: obj.quantity ?? 0,
    options: variantOptions,
    metadata: { parentId: obj.parentId, images: [obj.imageUrl] },
    prices: getPrices(obj.wholeSalePrice),
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
