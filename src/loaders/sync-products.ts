import { AwilixContainer } from "awilix";

const syncProductsJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  // Add a flag to track if the job has already run
  let isJobExecuted = false;

  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create(
    "sync-products-create-job",
    {},
    "0 0 * * 3", // The cron expression for running every Wednesday at 00:00 (midnight)
    async () => {
      try {
        // Check if the job has already been executed
        if (isJobExecuted) {
          console.log("Job already executed. Skipping...");
          return;
        }

        // Set the flag to true, indicating the job has run
        isJobExecuted = true;

        // Rest of your existing job logic goes here
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
