import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  
  const syncOrdersService = req.scope.resolve("syncOrdersService");
  const orders = await syncOrdersService.syncOrders()

  res.json({
    status: 200,
    count: orders.count,
    data:orders,
  });
};
