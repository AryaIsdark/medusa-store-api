import { Request, Response } from "express";
import multer from "multer";
import { processExcelFile } from "./supplier-process-product-file";

const upload = multer({ dest: "uploads/" }).single("file");

export default async (req: multer, res: Response): Promise<void> => {
  const supplierService = req.scope.resolve("supplierService");

  upload(req, res, async (err: any) => {
    if (err) {
      console.error("Error uploading file:", err);
      return;
    }
    // Access the uploaded file
    const file = req.file;

    processExcelFile(file.path)
      .then(async (data) => {
        const response = await supplierService.bulkCreate(data);
        res.json({
          status: 200,
          data: response,
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
  });
};
