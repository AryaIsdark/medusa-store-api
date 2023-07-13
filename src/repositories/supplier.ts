import { Supplier } from "../models/supplier";
import { dataSource } from "@medusajs/medusa/dist/loaders/database";

export const SupplierRepository = dataSource.getRepository(Supplier);

export default SupplierRepository;
