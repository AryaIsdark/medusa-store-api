import { AwilixContainer } from "awilix";

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
      await supplierProductsService.beginCreateSync();
      await supplierProductsService.beginSyncUploadImages();
      await supplierProductsService.beginSyncImages();
    }
  );
};

export default syncProductsJob;
