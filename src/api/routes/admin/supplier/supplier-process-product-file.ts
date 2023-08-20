import { Response } from "express";
import multer from "multer";
import XLSX from "xlsx";
import crypto from "crypto";

// Helper function to extract the integer value from the "QTY" property
const extractQuantity = (qty) => {
  // Use regular expression to remove non-numeric characters
  const numericValue = qty.replace(/\D/g, "");
  // Parse the numeric value as an integer
  return parseInt(numericValue, 10);
};

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

const columnNameMapping = {
  Brand: "brand",
  Product: "productName",
  rpr: "rpr",
  QTY: "quantity",
  "Wholesale Price With Your Discount": "wholeSalePriceWithYourDiscount",
  "Wholesale Price": "wholeSalePrice",
  Promo: "promo",
  "Mega Deal Price": "megaDealPrice",
  Weight: "weight",
  SKU: "sku",
  EAN: "ean",
  "Expiry Date": "expiryDate",
  "Country Of Origin": "countryOfOrigin",
  "Product Url": "productUrl",
  "Image Url": "imageUrl",
  main_product_name: "mainProductName",
  variant_name: "variantName",
  is_variant: "isVariant",
  has_variants: "hasVariants",
  parent_id: "parentId",
};

function modifyFile(filename) {
  const workbook = XLSX.readFile(filename);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Skip the first 11 rows
  const range = XLSX.utils.decode_range(sheet['!ref']);
  range.s.r = 11;
  sheet['!ref'] = XLSX.utils.encode_range(range);

  // Get the content of row 9
  const row10 = XLSX.utils.sheet_to_json(sheet, { range: 9, header: 1 })[0];

  // Delete row 9
  XLSX.utils.sheet_add_aoa(sheet, [], { origin: 8 });

  // Insert row 9 data at the top
  XLSX.utils.sheet_add_aoa(sheet, [row10 as any], { origin: 0 });

  return sheet
}


export const processExcelFile = async (file) => {
  // console.log('heeeeeeeeey')
  const modifiedSheet = modifyFile(file)

  // Convert the sheet to JSON
  let test = XLSX.utils.sheet_to_json(modifiedSheet);

  
  const data = test.slice(9 , test.length)
  
  console.log('dataaaaaa',data)
  // Process the data
  data.forEach((row, index) => {

    // Split the product name into main_product_name and variant_name
    let parts = row["Product"].split(",");
    row["main_product_name"] = parts[0].trim();
    row["variant_name"] = parts.length > 1 ? parts[1].trim() : "";

    // Determine if the row is a variant
    row["is_variant"] = row["variant_name"] !== "";

    // Generate a parent_id for each row
    if (row["is_variant"]) {
      let hash = crypto.createHash("sha1");
      hash.update(row["Brand"] + row["main_product_name"]);
      row["parent_id"] =
        "PP" + hash.digest("hex").substring(0, 14).toUpperCase();
    } else {
      row["parent_id"] = row["SKU"];
    }

    // Extract the integer value from the "QTY" property
    // row["quantity"] = extractQuantity(row["QTY"]) ;
    row["quantity"] = 100 ;
  });

  // Count the number of variants for each parent_id
  let variantCounts = data.reduce((counts, row) => {
    if (row["is_variant"]) {
      counts[row["parent_id"]] = (counts[row["parent_id"]] || 0) + 1;
    }
    return counts;
  }, {});

  // Generate the main product name for products that have variants
  data.forEach((row) => {
    row["has_variants"] =
      row["is_variant"] && variantCounts[row["parent_id"]] > 1;
    if (row["has_variants"]) {
      row["main_product_name"] =
        row["Brand"] + " - " + row["main_product_name"];
    }
  });

  // Map the data properties based on the columnNameMapping
  const mappedData = data.map((row) => {
    const mappedRow = {};
    for (const key in row as any) {
      const mappedKey = columnNameMapping[key] || key;
      mappedRow[mappedKey] = row[key];
    }
    return mappedRow;
  });

  return mappedData;
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
