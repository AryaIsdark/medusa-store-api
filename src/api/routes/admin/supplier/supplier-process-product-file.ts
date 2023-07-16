import { Response } from "express";
import multer from "multer";
import ExcelJS from "exceljs";
// import { Supplier } from "models/supplier";

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

export const processExcelFile = async (file) => {
  let validationErrors = [];

  const workbook = new ExcelJS.Workbook();

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

  // Define the column name mapping
  const columnNameMapping = {
    Reference: "reference",
    "Combination Reference": "combinationReference",
    EAN13: "ean13",
    "Combination EAN13": "combinationEan13",
    "Combination Price": "combinationPrice",
    Price: "price",
    "Product Name": "productName",
    "Attribute Group: Variationer": "attributeGroup",
    "Cost Pirce": "costPrice",
    "Combination Cost Price": "combinationcostPrice",
    Quantity: "quantity",
    Weight: "weight",
    product_type: "product_type",
    Category: "category",
    Brand: "brand",
    Supplier: "supplier",
    "Product Images": "productImages",
    // SKU: "sku",
    // EAN: "ean",
    // "Expiry Date": "expiryDate",
    // "Country Of Origin": "countryOfOrigin",
    // "Product Url": "productUrl",
    // "Image Url": "imageUrl",
  };

  // Process each row
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const rowData = {};
    // Process each cell in the row
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1];
      const propertyName = columnNameMapping[header];
      if (propertyName) {
        rowData[propertyName] = cell.value;
      }
    });

    // Push row data to the array
    rows.push(rowData);
  });

  const productsArray = []; // Define the array to store the products
  rows.forEach((row) => {
    const rowValidationErrors = validateRow(row);

    if (rowValidationErrors?.errors.length) {
      validationErrors.push(rowValidationErrors);
    } else {
      // Push product object to the productsArray
      const product = {
        // brand: row.brand,
        // product: row.product,
        // rpr: row.rrp || 0,
        // wholeSalePriceWithYourDiscount: row.wholeSalePriceWithYourDiscount || 0,
        // wholeSalePrice: row.wholeSalePrice || 0,
        // promo: row.promo || 0,
        // megaDealPrice: row.megaDealPrice || 0,
        // weight: row.weight || 0,
        // sku: row.sku,
        // ean: row.ean,
        // expiryDate: row.expiryDate,
        // countryOfOrigin: row.countryOfOrigin || "N/A",
        // productUrl: row.productUrl || "N/A",
        // imageUrl: row.imageUrl || "N/A",
        reference: row.reference,
        combinationReference: row.combinationReference,
        ean13: row.ean13,
        combinationEan13: row.combinationEan13,
        combinationPrice: parseInt(row.combinationPrice, 10) || 10,
        price: parseInt(row.price, 10) || 0,
        productName: row.productName,
        costPrice: parseInt(row.costPrice, 10) || 10,
        combinationcostPrice: parseInt(row.combinationcostPrice, 10) || 10,
        quantity: row.quantity,
        weight: parseInt(row.weight, 10) || 10,
        product_type: row.product_type,
        category: row.category,
        brand: row.brand,
        supplier: row.supplier,
        productImages: row.productImages,
        attributeGroup: row.attributeGroup,
      };

      productsArray.push(product);
    }
  });

  if (validationErrors.length) {
    throw validationErrors;
  }

  // Return the list of product objects
  return productsArray.slice(1, productsArray.length);
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
        res.json({
          count: data.length,
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
  });
};
