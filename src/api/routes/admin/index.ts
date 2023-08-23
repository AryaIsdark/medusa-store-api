import { Router } from "express";
import wmsCreateArticles from "./wms/wms-create-articles";
import wmsGetPurchaseOrderSuggestions from "./wms/wms-get-purchase-order-suggestions";
import { wrapHandler } from "@medusajs/medusa";
import supplierProcessProductFile from "./supplier/supplier-process-product-file";
import supplierBulkAddProducts from "./supplier/supplier-bulk-add-products";
import supplierGetProducts from "./supplier/supplier-get-products";
import supplierBulkDeleteProducts from "./supplier/supplier-bulk-delete-products";
import deleteProducts from "./products/delete-products";
import getErrorLogs from "./error-logs/get-error-logs";

// Initialize a custom router
const router = Router();

export function attachAdminRoutes(adminRouter: Router) {
  // Attach our router to a custom path on the admin router
  adminRouter.use("/custom", router);
  // Ware House Management (WMS) Endpoints
  router.put("/wms/create-articles", wrapHandler(wmsCreateArticles));

  router.get(
    "/wms/purchase-orders/suggestions",
    wrapHandler(wmsGetPurchaseOrderSuggestions)
  );

  router.get("/supplier/products", wrapHandler(supplierGetProducts));

  // Supplier Endpoints
  router.post(
    "/supplier/process-product-file",
    wrapHandler(supplierProcessProductFile)
  );
  router.post(
    "/supplier/bulk-add-products",
    wrapHandler(supplierBulkAddProducts)
  );

  router.post(
    "/supplier/bulk-delete-products",
    wrapHandler(supplierBulkDeleteProducts)
  );

  // Products endpoints
  router.get("/products/delete-products", wrapHandler(deleteProducts));

  // error-logs endpoint
  router.get("/error-logs", wrapHandler(getErrorLogs));
}
