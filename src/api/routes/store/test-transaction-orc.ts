import { Request, Response } from "express";
import {
  TransactionOrchestrator,
  TransactionStepDefinition,
} from "../../../orchestrators/transaction-orchestrator";
import {
  groupProductsByReference,
  prepareProductObj,
  prepareProductVarianObj,
} from "../admin/products/helpers/helpers";
import { Product } from "@medusajs/medusa";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { CreateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant";

const uploadImages = async () => {
  return "images are uploaded";
};

const deleteImages = async () => {
  return "images are deleted now";
};

const deleteProduct = async () => {
  return "product is deleted";
};

export default async (req: Request, res: Response): Promise<void> => {
  const syncProductService = req.scope.resolve("productSyncService");
  const supplierService = req.scope.resolve("supplierService");
  const shippingProfileService = req.scope.resolve("shippingProfileService");
  const salesChannelService = req.scope.resolve("salesChannelService");
  const regionService = req.scope.resolve("regionService");

  const defaulShippingProfilePromise = shippingProfileService.retrieveDefault();
  const defaultSalesChannelPromise = salesChannelService.retrieveDefault();
  const regionsPromise = regionService.list();
  const supplierProductsPromise = supplierService.list();

  try {
    const [
      defaulShippingProfile,
      defaultSalesChannel,
      regions,
      supplierProducts,
    ] = await Promise.all([
      defaulShippingProfilePromise,
      defaultSalesChannelPromise,
      regionsPromise,
      supplierProductsPromise,
    ]);

    const grouppedProducts = groupProductsByReference(supplierProducts);

    // Process products and create transactions
    const transactions: TransactionOrchestrator[] = [];

    for (const p of grouppedProducts) {
      const imageUrls = [];
      const variants = p.variants || [];
      const baseProduct = variants[0];
      const productDTO: CreateProductInput = prepareProductObj(
        baseProduct,
        imageUrls,
        defaulShippingProfile,
        defaultSalesChannel
      );

      // Add a new transaction step for each product
      const transactionSteps: TransactionStepDefinition[] = [
        {
          title: `create-product-and-variants`,
          id: p.id,
          action: () =>
            syncProductService.createProductAndVariants(productDTO, variants),
          rollback: (payload) =>
            syncProductService.rollbackProduct(payload.productId),
        },
      ];

      const syncProductsTransaction = new TransactionOrchestrator(
        `sync-product:${p.id}`,
        transactionSteps
      );

      transactions.push(syncProductsTransaction);
    }

    // Execute transactions sequentially
    for (const transaction of transactions) {
      try {
        await transaction.startTransaction();
      } catch (error) {
        // Handle errors here
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa", error);
        await transaction.rollbackTransaction(error);
      }
    }
    res.json({
      status: 200,
      transactions,
      data: "Sync Products Task completed",
    });
  } catch (e) {
    // Handle any errors here or log them
    res.status(500).json({
      status: 500,
      error: "Error syncing products",
    });
  }
};
