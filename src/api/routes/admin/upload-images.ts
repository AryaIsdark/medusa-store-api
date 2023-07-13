import { Request, Response } from "express";
import cloudinary from "cloudinary";
import multer from "multer";

const upload = multer({ dest: "uploads/" }).array("files");

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async (req: multer, res: Response): Promise<void> => {
  upload(req, res, async (err: any) => {
    if (err) {
      console.error("Error uploading files:", err);
      return;
    }

    // Access the uploaded files
    const files = req.files;

    try {
      // Upload each file to Cloudinary
      const uploads = await Promise.all(
        files.map((file) => cloudinary.v2.uploader.upload(file.path))
      );

      // Extract URLs from the Cloudinary upload responses
      const data = uploads.map(
        (uploadResult: cloudinary.UploadApiResponse) => ({
          url: uploadResult.secure_url,
        })
      );

      // Send a response with the uploaded URLs
      res.json({ uploads: data });
    } catch (error) {
      console.error("Error processing files:", error);
      res.status(500).send("Error processing files");
    }
  });
};
