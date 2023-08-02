import { SupplierProductVariant } from "../models/supplier-product-variant";
import { dataSource } from "@medusajs/medusa/dist/loaders/database";

export const SupplierProduvtVariantRepository = dataSource.getRepository(
  SupplierProductVariant
);

export default SupplierProduvtVariantRepository;
