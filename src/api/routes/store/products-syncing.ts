import { Request, Response } from "express";
import cloudinary from "cloudinary";
import multer from "multer";
import ExcelJS from "exceljs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const getNonFlatKeys = (obj) => {
  const nonFlatKeys = [];

  for (const key in obj) {
    if (obj[key] !== null) {
      // Check if the key belongs to the object itself
      if (typeof obj[key] === "object") {
        nonFlatKeys.push(key);
      }
    }
  }

  return nonFlatKeys;
};

const validateRow = (row) => {
  const errors = [];
  const keys = getNonFlatKeys(row);
  if (keys.length) {
    keys.forEach((key) =>
      errors.push({ message: "Non-flat key structure found in key", key })
    );
  }

  if (errors.length) {
    return { row, errors: errors };
  }
};

const processExcelFile = async (file) => {
  let validationErrors = [];
  const workbook = new ExcelJS.Workbook();

  // Configure streaming options
  //   workbook.xlsx.read(file);

  // Load the workbook
  await workbook.xlsx.readFile(file);

  // Get the first sheet
  const worksheet = workbook.getWorksheet(1);

  // Get the header row
  const headerRow = worksheet.getRow(1);
  const headers = [];

  // Extract the header names
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    headers.push(cell.value);
  });

  // Define an array to store the row data
  const rows = [];

  // Process each row
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const rowData = {};
    // Process each cell in the row
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1];
      rowData[header] = cell.value;
    });

    // Push row data to the array

    rows.push(rowData);
  });

  rows.forEach((row) => {
    const rowValidationErrors = validateRow(row);

    if (rowValidationErrors?.errors.length) {
      validationErrors.push(rowValidationErrors);
    }
  });

  if (validationErrors.length) {
    throw validationErrors;
  }
  // Return the list of objects
  // Exclude header
  return rows.slice(1, rows.length);
};

const upload = multer({ dest: "uploads/" }).single("file");

export default async (req: multer, res: Response): Promise<void> => {
  upload(req, res, async (err: any) => {
    if (err) {
      console.error("Error uploading file:", err);
      return;
    }
    // Access the uploaded file
    const file = req.file;
    processExcelFile(file.path)
      .then(async (data) => {
        const top100 = data.slice(0, 100);

        // const uploads = await Promise.all(
        //   data.map((item) => cloudinary.v2.uploader.upload(item.imageUrl))
        // );

        // top100.forEach((item) => cloudinary.v2.uploader.upload(item.imageUrl));

        res.json({
          count: data.length,
          //   uploads: uploads,
          data: data,
        });
      })
      .catch((error) => {
        console.error(
          "An error occurred while processing the Excel file:",
          error
        );
        res.json({
          status: 400,
          count: error.length,
          validationErrors: error,
        });
      });
  });
};
