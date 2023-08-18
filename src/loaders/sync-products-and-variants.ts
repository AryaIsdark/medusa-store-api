import { AwilixContainer } from "awilix";

const SyncProductsAndVariants = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create("sync-supplier-products", {}, "*/12 * * * *", async () => {
    
    const syncProductsService = container.resolve("syncProductsService");
    
    try{
      const response = await syncProductsService.syncProductsAndVariants();
    }
    catch(error){
      console.log('error occured while running cron job sync-supplier-product', error)
    }
    
  });
};

export default SyncProductsAndVariants;
