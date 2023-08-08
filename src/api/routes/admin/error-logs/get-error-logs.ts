import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const errorLogService = req.scope.resolve("errorLogService");
  const errorLogs = await errorLogService.list();

  res.json({
    status: 200,
    data: errorLogs,
  });
};
