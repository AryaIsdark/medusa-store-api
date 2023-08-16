import { Router } from "express";
import wmsSubmitOrder from "./wms-submit-order";
import webhookOrderStatus from "./webhook-order-status";
import wmsCheckItemAvailability from "./wms-check-item-availabilty";
import wmsOrderPickedUp from "./webhook-order-picked-up";
import getVariant from "./get-variant";
import { wrapHandler } from "@medusajs/medusa";
import syncProductsV2 from "./sync-products-v2";
import syncUpdateProducts from "./sync-update-products";
import syncUploadProductImages from "./sync-upload-product-images";
import syncProductImages from "./sync-product-images";
import resetDb from "./reset-db";
import ftpDownload from "./ftp-download";
import readFiles from "./read-files";

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
  router.get("/sync-create-products", wrapHandler(syncProductsV2));
  router.get("/sync-update-products", wrapHandler(syncUpdateProducts));
  router.get(
    "/sync-upload-product-images",
    wrapHandler(syncUploadProductImages)
  );
  router.get("/sync-product-images", wrapHandler(syncProductImages));
  router.get("/reset-db", wrapHandler(resetDb));
  router.get("/ftp-download", wrapHandler(ftpDownload));
  router.get("/read-files", wrapHandler(readFiles));
}
