import { Router } from "express";
import wmsCreateArticles from "./wms-create-articles";
import { wrapHandler } from "@medusajs/medusa";

// Initialize a custom router
const router = Router();

export function attachAdminRoutes(adminRouter: Router) {
  // Attach our router to a custom path on the admin router
  adminRouter.use("/wms", router);

  router.put("/create-articles", wrapHandler(wmsCreateArticles));
}
