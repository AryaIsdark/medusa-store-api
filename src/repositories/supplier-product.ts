import { SupplierProduct } from "../models/supplier-product";
import { dataSource } from "@medusajs/medusa/dist/loaders/database";

export const SupplierRepository = dataSource.getRepository(SupplierProduct);

export default SupplierRepository;
