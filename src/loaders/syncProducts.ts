import { AwilixContainer } from "awilix";
import {
  getImages,
  groupProductsByReference,
  prepareProductObj,
  prepareProductVarianObj,
  uploadImages,
} from "../api/routes/admin/products/helpers/helpers";

const syncProductsJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create(
    "sync-products-create-job",
    {},
    "* * * * *",
    async () => {
      // job to execute
      const supplierProductsService = container.resolve(
        "supplierProductsService"
      );
      await supplierProductsService.beginSync();
    }
  );
};

export default syncProductsJob;
