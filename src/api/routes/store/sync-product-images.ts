import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const syncProductsService = req.scope.resolve("syncProductsService");

  try {
    const data = await syncProductsService.beginSyncImages();
    res.json({
      status: 200,
      message: "syncing finished succesfully",
      data,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
    res.json({
      status: 500,
      error: e,
    });
  }
};
