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
      const syncProductsService = container.resolve("syncProductsService");
      await syncProductsService.beginCreateSync();
    }
  );
};

export default syncProductsJob;
