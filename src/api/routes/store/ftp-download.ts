import { Request, Response } from "express";


export default async (req: Request, res: Response): Promise<void> => {

  const supplierService = req.scope.resolve("supplierService");
  
  try{

    const data = await supplierService.downloadFiles()
    res.status(200)
    res.json({
      status: 200,
      data
    })

  }
  catch(e){
    res.status(500)
    res.json({
      status: 500,
      error: e
    })
  }
};
