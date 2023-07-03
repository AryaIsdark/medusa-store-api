import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  //   const wmsService = req.scope.resolve("wmsService");
  //   const article = await wmsService.checkItemAvailibility(
  //     req.query.articleNumber
  //   );
  console.log("request from order-status webhook", req.body);
  //   console.log("response from order-status webhook", res);

  res.json({
    status: 200,
    data: {
      req: req.body,
      res,
    },
  });
};
