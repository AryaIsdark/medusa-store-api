import { AwilixContainer } from "awilix";


const DownloadProductFilesJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create("download-product-files", {}, "10 0 * * *", async () => {
    const supplierService = container.resolve("supplierService");
    try{
       await supplierService.downloadFiles()
    }
    catch(error){
        console.log('download-product-files cron job failed', error)
    }
    
  });
};

export default DownloadProductFilesJob;
