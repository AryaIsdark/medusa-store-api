import { Request, Response } from "express";

const handleOrderHasBeenPicked = () => {};

export default async (req: Request, res: Response): Promise<void> => {
  const wmsService = req.scope.resolve("wmsService");
  //   const article = await wmsService.checkItemAvailibility(
  //     req.query.articleNumber
  //   );
  console.log("request from order-status webhook", req.body);
  //   console.log("response from order-status webhook", res);
  const orderId = req.body.orderId;
  const orderNumber = req.body.orderNumber;
  const orderStatus = req.body.orderStatus;

  // Something has gone wrong with the order.
  if (orderStatus.number === 150) {
    // TODO
    // update Order in Meudsa change status to actionRequired
    // Send and email to admin with URL
  }

  // The order is in an editable state.
  if (orderStatus.number === 200) {
    // TODO
    // update Order in Meudsa change status to confirmed
    // Send and email to admin with URL
  }

  // Order Status 400 means that the order has been picked.
  if (orderStatus.number === 400) {
    // TODO
    // update Order in Meudsa change status to confirmed
    wmsService.createFulfillment(orderNumber);
  }

  // Order Status 450 means that The order has been sent to a separate shipping platform, which will generate shipping labels.
  if (orderStatus.number === 450) {
    // TODO
  }
  // The transporter has collected the order from the warehouse. The order is on its way to the end customer.
  if (orderStatus.number === 500) {
    // TODO
  }

  res.json({
    status: 200,
    data: {
      req: req.body,
    },
  });
};
