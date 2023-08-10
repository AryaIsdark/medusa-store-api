import { AwilixContainer } from "awilix";

const publishJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create("publish-products", {}, "0 0 * * *", async () => {
    // job to execute
    const productService = container.resolve("productService");
    const draftProducts = await productService.list({
      status: "draft",
    });

    for (const product of draftProducts) {
      await productService.update(product.id, {
        status: "published",
      });
    }
  });
};

export default publishJob;
