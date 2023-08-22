import { AwilixContainer } from "awilix";
import { processExcelFile } from "../api/routes/admin/supplier/supplier-process-product-file";

const directory = "./product_downloads/powerbody.xls";

const SyncProductsJob = async (
    container: AwilixContainer,
    options: Record<string, any>
) => {
    const jobSchedulerService = container.resolve("jobSchedulerService");
    jobSchedulerService.create("sync-products-cron-job", {}, "0 */12 * * *", async () => {
        const supplierService = container.resolve("supplierService");
        const syncProductsService = container.resolve("syncProductsService");

        try {
            console.log('Downloading files...')
            await supplierService.downloadFiles()
            console.log('Processing excel file...')
            processExcelFile(directory).then(async (data) => {
                console.log('Syncing Supplier Products and Variants Tables...')
                await supplierService.syncSupplierProducts(data);
                console.log('Syncing Products table')
                await syncProductsService.syncProductsAndVariants();
            })
        }
        catch (error) {
            console.log('something went wrong while syncing products please see error', error)
        }
    });
};

export default SyncProductsJob;
