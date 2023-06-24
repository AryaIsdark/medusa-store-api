import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const cartService = await req.scope.resolve("cartService");
  const wmsService = req.scope.resolve("wmsService");
  // example cartID  "cart_01H3P54Y7XJQ6W7J56VNGEM5JF"
  const cart = await cartService.retrieveWithTotals(req.query.cartId);

  // Check if card exists
  if (!cart.id) {
    res.json({
      status: 404,
      message: "Cart with given id was not found in the system",
    });
  }

  // TODO: Check if cart checkout is completed

  // Submit order to WMS
  const orderResponse = await wmsService.submitOrder(cart);
  res.json({
    status: 200,
    data: orderResponse.data,
  });
};
