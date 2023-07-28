import { AwilixContainer } from "awilix";

const syncUploadProductImagesJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create(
    "sync-upload-product-images-job",
    {},
    "* * * * *",
    async () => {
      // job to execute
      const syncProductsService = container.resolve("syncProductsService");
      await syncProductsService.beginSyncUploadImages();
    }
  );
};

export default syncUploadProductImagesJob;
