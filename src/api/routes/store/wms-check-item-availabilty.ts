import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const wmsService = req.scope.resolve("wmsService");
  const article = await wmsService.checkItemAvailibility(
    req.query.articleNumber
  );

  res.json({
    status: 200,
    data: article.data,
  });
};
