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

    const productFilesDirectory = "/public_html/nutri-stock/powerbody.xls";
    const localDirectory = "./product_downloads/powerbody.xls";
    console.log("Connected to FTP server");

    if (!fs.existsSync(localDirectory)) {
      fs.mkdirSync(localDirectory);
    }

    const remoteFilePath = `${productFilesDirectory}`;
    const localFilePath = `${localDirectory}`;
    await client.downloadTo(localFilePath, remoteFilePath);

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
