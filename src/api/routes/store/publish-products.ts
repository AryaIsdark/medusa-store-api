import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {

    const productService = req.scope.resolve("productService");
    
    try {
        const products = await productService.list({status: 'draft' }, {skip: 0} )
        Promise.all((products.forEach((product)=> {
            productService.update(product.id, {status: 'published'})
        })))
        
        res.json({
            status: 200,
            count: products.length,
            data: products
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
