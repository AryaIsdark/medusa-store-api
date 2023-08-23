import { Router } from "express";
import wmsSubmitOrder from "./wms-submit-order";
import webhookOrderStatus from "./webhook-order-status";
import getVariant from "./get-variant";
import { wrapHandler } from "@medusajs/medusa";
import resetDb from "./reset-db";
import ftpDownload from "./ftp-download";
import readFiles from "./read-files";
import syncProducts from "./sync-products";
import syncSupplierProducts from "./sync-supplier-products";

// Initialize a custom router
const router = Router();

export function attachStoreRoutes(storeRouter: Router) {
  // Attach our router to a custom path on the store router

  storeRouter.use("/wms", router);

  // Define a GET endpoint on the root route of our custom path
  router.get("/create-wms-order", wrapHandler(wmsSubmitOrder));
  router.post("/webhooks/order-status", wrapHandler(webhookOrderStatus));
  router.get("/get-variant", wrapHandler(getVariant));
  router.get("/sync-supplier-products", wrapHandler(syncSupplierProducts));
  router.get("/sync-products", wrapHandler(syncProducts));
  router.get("/reset-db", wrapHandler(resetDb));
  router.get("/ftp-download", wrapHandler(ftpDownload));
  router.get("/read-files", wrapHandler(readFiles));
}
