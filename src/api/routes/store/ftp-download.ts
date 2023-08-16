import { Request, Response } from "express";
import * as ftp from "basic-ftp";
import * as fs from "fs";

export default async (req: Request, res: Response): Promise<void> => {
  const client = new ftp.Client();
  try {
    // Connect to the FTP server
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: 21,
    });

    const productFilesDirectory =
      "/public_html/nutri-stock/test/products-test-file.xlsx";
    const localDirectory = "./product_downloads";
    const localFilePath = `${localDirectory}/products-test-file.xlsx`;

    if (!fs.existsSync(localDirectory)) {
      fs.mkdirSync(localDirectory);
    }

    // Delete the local file if it already exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    const remoteFilePath = `${productFilesDirectory}`;
    await client.downloadTo(localFilePath, remoteFilePath);

    console.log("File downloaded and any existing local file deleted.");

    res.json({
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      status: 500,
      error,
    });
  } finally {
    // Close the FTP connection
    client.close();
  }
};
