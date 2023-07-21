import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const supplierProductService = req.scope.resolve("supplierProductService");
  const result = await supplierProductService.list();

  res.json({
    status: 200,
    data: result,
  });
};
