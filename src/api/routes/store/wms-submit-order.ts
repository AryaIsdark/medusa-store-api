import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const orderService = await req.scope.resolve("orderService");
  const cartService = await req.scope.resolve("cartService");
  const wmsService = req.scope.resolve("wmsService");
  // example orderId  "order_01H3QA2RHRCDCVXWHT0W8SVNKA"
  const order = await orderService.retrieveWithTotals(req.query.orderId);

  // Check if card exists
  if (!order.id) {
    res.json({
      status: 404,
      message: "Order with given id was not found in the system",
    });
  }

  const cart = await cartService.retrieveWithTotals(order.cart_id);
  // Submit order to WMS
  const orderResponse = await wmsService.submitOrder(order, cart);
  res.json({
    status: 200,
    data: orderResponse.data,
  });
};
