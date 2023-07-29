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
      try {
        // job to execute
        const supplierProductService = container.resolve(
          "supplierProductService"
        );
        const newSupplilerProducts = await supplierProductService.search({
          isCreatedInStore: false,
        });
        const syncProductsService = container.resolve("syncProductsService");

        console.log("sync-products-job:17", newSupplilerProducts.length);
        if (newSupplilerProducts.length) {
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
