import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  console.log("aaaaaaaaaaaaaaaaaaa", req.query.variantId);
  const wmsService = req.scope.resolve("wmsService");
  const variant = await wmsService.getProductVariant(req.query.variantId);

  res.json({
    status: 200,
    data: variant,
  });
};
