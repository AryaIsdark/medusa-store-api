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
        const syncProductsService = container.resolve("syncProductsService");
        await syncProductsService.beginCreateSync();
      } catch (error) {
        // Handle the error (you can log it, for example)
        console.error("Error occurred during job execution:", error);
      }
    }
  );
};

export default syncProductsJob;
