import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const wmsService = req.scope.resolve("wmsService");
  const result = await wmsService.createArticles(req.body);

  res.json({
    status: 200,
    data: result,
  });
};
