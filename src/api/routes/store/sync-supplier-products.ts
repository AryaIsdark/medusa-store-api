import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const supplierService = req.scope.resolve("supplierService");
  const supplierProductService = req.scope.resolve("supplierProductService");

  try {
    const supplierProducts = await supplierProductService.list()
    await supplierService.syncSupplierProducts(supplierProducts);
    res.json({
      status: 200,
      message: "syncing finished succesfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500);
    res.json({
      status: 500,
      error: e,
    });
  }
};
