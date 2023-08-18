import { processExcelFile } from "../api/routes/admin/supplier/supplier-process-product-file";
import { AwilixContainer } from "awilix";

const SyncSupplierProductsJob = async (
  container: AwilixContainer,
  options: Record<string, any>
) => {
  const jobSchedulerService = container.resolve("jobSchedulerService");
  jobSchedulerService.create("sync-supplier-products", {}, "35 22 * * *", async () => {
    
    const supplierService = container.resolve("supplierService");
    const directory = "./product_downloads/products-test-file.xlsx";

    try{
      processExcelFile(directory).then(async (data) => {
      const response = await supplierService.syncSupplierProducts(data);
    })

    }
    catch(error){
      console.log('error occured while running cron job sync-supplier-product', error)
    }
    
  });
};

export default SyncSupplierProductsJob;
