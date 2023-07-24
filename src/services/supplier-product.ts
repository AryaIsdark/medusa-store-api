import { TransactionBaseService } from "@medusajs/medusa";
import SupplierProductRepository from "../repositories/supplier-product";
import { SupplierProduct } from "models/supplier-product";

class SupplierProductService extends TransactionBaseService {
  protected readonly supplierProductRepository: typeof SupplierProductRepository;

  constructor({ supplierProductRepository, manager }) {
    super({ supplierProductRepository, manager });

    this.supplierProductRepository = supplierProductRepository;
    this.manager_ = manager;
  }

  async bulkCreate(data) {
    const success = [];
    const fail = [];
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    Promise.all(
      data.forEach(async (d) => {
        try {
          const newSupplier = await this.create(d);
          supplierRepo.save(newSupplier);
          success.push(d);
        } catch (error) {
          fail.push(error);
        }
      })
    );

    return success;
  }

  async bulkDelete() {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
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
    const existingProducts = await this.search({ sku: data.sku });
    if (existingProducts.length) {
      throw new Error("Product with given SKU already exists");
    }
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    const newSupplier = supplierRepo.create(data);
    return supplierRepo.save(newSupplier);
  }

  async findOne(id) {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    return supplierRepo.findOne(id);
  }

  async update(id, data: Partial<SupplierProduct>) {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    const supplier = await supplierRepo.findOne({ where: { id } });
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    supplierRepo.merge(supplier, data);
    return supplierRepo.save(supplier);
  }

  async delete(id) {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    const supplier = await supplierRepo.findOne(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    return supplierRepo.remove(supplier);
  }

  async list() {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    return supplierRepo.find();
  }

  async findByReference(reference: string) {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    return supplierRepo.findOne({ where: { reference } });
  }

  async findByParentId(parentId: string) {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    return supplierRepo.find({ where: { parentId } });
  }

  async search(query: Partial<SupplierProduct>) {
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    return supplierRepo.find({ where: query });
  }
}

export default SupplierProductService;
