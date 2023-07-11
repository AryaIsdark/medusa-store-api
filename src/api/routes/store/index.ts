import { Router } from "express";
import wmsSubmitOrder from "./wms-submit-order";
import webhookOrderStatus from "./webhook-order-status";
import wmsCheckItemAvailability from "./wms-check-item-availabilty";
import wmsOrderPickedUp from "./webhook-order-picked-up";
import getVariant from "./get-variant";
import syncProducts from "./products-syncing";
import { wrapHandler } from "@medusajs/medusa";

// Initialize a custom router
const router = Router();

export function attachStoreRoutes(storeRouter: Router) {
  // Attach our router to a custom path on the store router

  storeRouter.use("/wms", router);

  // Define a GET endpoint on the root route of our custom path
  // router.get("/", wrapHandler(wmsSubmitOrder));
  router.get("/check-item-availability", wrapHandler(wmsCheckItemAvailability));
  router.get("/create-wms-order", wrapHandler(wmsSubmitOrder));
  router.post("/webhooks/order-status", wrapHandler(webhookOrderStatus));
  router.post("/webhooks/order-picked-up", wrapHandler(wmsOrderPickedUp));
  router.get("/get-variant", wrapHandler(getVariant));
  router.post("/sync-products", wrapHandler(syncProducts));
}
