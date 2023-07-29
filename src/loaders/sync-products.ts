import { AwilixContainer } from "awilix";

const syncProductsJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create(
    "sync-products-create-job",
    {},
    "0 0 * * *", // The cron expression for running every day at 00:00 (midnight)
    async () => {
      try {
        // Your job logic goes here
        const supplierProductService = container.resolve(
          "supplierProductService"
        );
        const newSupplierProducts = await supplierProductService.search({
          isCreatedInStore: false,
        });
        const syncProductsService = container.resolve("syncProductsService");

        console.log("sync-products-job:17", newSupplierProducts.length);
        if (newSupplierProducts.length) {
          await syncProductsService.beginCreateSync();
        }
      } catch (error) {
        // Handle the error (you can log it, for example)
        console.error("Error occurred during job execution:", error);
      }
    }
  );
};

export default syncProductsJob;
