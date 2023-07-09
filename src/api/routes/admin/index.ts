import { Router } from "express";
import wmsCreateArticles from "./wms-create-articles";
import wmsGetPurchaseOrderSuggestions from "./wms-get-purchase-order-suggestions";
import uploadImages from "./upload-images";
import { wrapHandler } from "@medusajs/medusa";

// Initialize a custom router
const router = Router();

export function attachAdminRoutes(adminRouter: Router) {
  // Attach our router to a custom path on the admin router
  adminRouter.use("/wms", router);

  router.put("/create-articles", wrapHandler(wmsCreateArticles));
  router.get(
    "/purchase-orders/suggestions",
    wrapHandler(wmsGetPurchaseOrderSuggestions)
  );

  router.post("/upload-images", wrapHandler(uploadImages));
}
