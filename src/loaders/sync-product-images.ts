import { AwilixContainer } from "awilix";

const syncProductImagesJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create(
    "sync-product-images-job",
    {},
    "* * * * *",
    async () => {
      // job to execute
      const syncProductsService = container.resolve("syncProductsService");
      await syncProductsService.beginSyncImages();
    }
  );
};

export default syncProductImagesJob;
