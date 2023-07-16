import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const supplierService = req.scope.resolve("supplierService");
  const result = await supplierService.bulkDelete();

  res.json({
    status: 200,
    data: result,
  });
};
