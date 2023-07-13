import { Request, Response } from "express";
import { Product, ProductStatus, ProductService } from "@medusajs/medusa";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async (req: Request, res: Response): Promise<void> => {
  const supplierService = req.scope.resolve("supplierService");
  const productService = req.scope.resolve("productService");

  const supplierProducts = await supplierService.list();
  supplierProducts.forEach((product) => {
    cloudinary.v2.uploader.upload(product.imageUrl).then((uploadResult) => {
      productService.create({
        title: product.product,
        status: ProductStatus.DRAFT,
        profile_id: "sp_01H4ESR3XXVC8X0ZPJZY3045N5",
        thumbnail: uploadResult.secure_url || "",
        sales_channels: [{ id: "sc_01H4ESR4PV1D6EG8AH9G90GKAK" }],
      });
    });
  });

  res.json({
    status: 200,
    data: supplierProducts,
  });
};
