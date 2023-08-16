import { Request, Response } from "express";
import { processExcelFile } from "../admin/supplier/supplier-process-product-file";

export default async (req: Request, res: Response): Promise<void> => {
  const directory = "./product_downloads/powerbody.xls";
  const supplierService = req.scope.resolve("supplierService");

  processExcelFile(directory)
    .then(async (data) => {
      const response = await supplierService.syncSupplierProducts(data);

      res.json({
        status: 200,
        data: data,
      });
    })
    .catch((error) => {
      console.error(
        "An error occurred while processing the Excel file:",
        error
      );
      res.status(400);
      res.json({
        status: 400,
        count: error.length,
        validationErrors: error,
      });
    });
};
