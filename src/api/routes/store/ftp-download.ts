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

    const productFilesDirectory = "/public_html/nutri-stock";
    const localDirectory = "./product_downloads";
    console.log("Connected to FTP server");

    // List files in the remote directory
    const fileList = await client.list(productFilesDirectory);

    if (!fs.existsSync(localDirectory)) {
      fs.mkdirSync(localDirectory);
    }

    // Download each file
    for (const file of fileList) {
      const remoteFilePath = `${productFilesDirectory}/${file.name}`;
      const localFilePath = `${localDirectory}/${file.name}`;
      await client.downloadTo(localFilePath, remoteFilePath);

      console.log(`Downloaded: ${file.name}`);
    }

    res.json({
      status: 200,
      files: fileList.map((entry) => entry.name),
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
