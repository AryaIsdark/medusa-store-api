import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const productService = req.scope.resolve("productService");
  const products = productService.list();
  await Promise.all(
    products.forEach((element) => {
      productService.delete(element.id);
    })
  );

  res.json({
    status: "200",
    data: "Products were deleted",
  });
};
