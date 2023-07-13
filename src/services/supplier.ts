import { TransactionBaseService } from "@medusajs/medusa";
import SupplierRepository from "../repositories/supplier";

class SupplierService extends TransactionBaseService {
  protected readonly supplierRepository: typeof SupplierRepository;

  constructor({ supplierRepository, manager }) {
    super({ supplierRepository, manager });

    this.supplierRepository = supplierRepository;
    this.manager_ = manager;
  }

  async bulkCreate(data) {
    const success = [];
    const fail = [];
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    data.forEach((d) => {
      const newSupplier = supplierRepo.create(d);
      supplierRepo.save(newSupplier);
      success.push(d);
    });

    return success;
  }

  async bulkDelete() {
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    const batchSize = 1000; // Adjust the batch size according to your needs

    try {
      let offset = 0;
      let batchDeleted = 0;

      do {
        const suppliers = await supplierRepo.find({
          skip: offset,
          take: batchSize,
        });

        if (suppliers.length > 0) {
          await supplierRepo.remove(suppliers);
          batchDeleted += suppliers.length;
          offset += batchSize;
        } else {
          break; // No more records found, exit the loop
        }
      } while (true);

      console.log(
        `Data deleted successfully. Total records deleted: ${batchDeleted}`
      );
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }

  async create(data) {
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    const newSupplier = supplierRepo.create(data);
    return supplierRepo.save(newSupplier);
  }

  async findOne(id) {
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    return supplierRepo.findOne(id);
  }

  async update(id, data) {
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    const supplier = await supplierRepo.findOne(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    supplierRepo.merge(supplier, data);
    return supplierRepo.save(supplier);
  }

  async delete(id) {
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    const supplier = await supplierRepo.findOne(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    return supplierRepo.remove(supplier);
  }

  async list() {
    const supplierRepo = this.manager_.withRepository(this.supplierRepository);
    return supplierRepo.find();
  }
}

export default SupplierService;
