import { Request, Response } from "express";
import * as ftp from "basic-ftp";

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

    console.log("Connected to FTP server");

    // List files in the remote directory
    const list = await client.list();
    console.log(
      "Remote files:",
      list.map((entry) => entry.name)
    );

    // Download a file
    // const remoteFilePath = "/path/to/remote/file.txt";
    // const localFilePath = "./downloaded-file.txt";
    // await client.downloadTo(localFilePath, remoteFilePath);
    // console.log("File downloaded to:", localFilePath);
    console.log(list);
    const fileNames = list.map((entry) => entry.name);

    res.json({
      status: 200,
      files: fileNames,
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
