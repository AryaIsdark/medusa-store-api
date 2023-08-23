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
      data.forEach(async (d: SupplierProduct) => {
        console.log("sku", d.sku, d.sku.length);
        const existing = await this.search({ sku: d.sku });
        console.log("existing", existing);
        if (existing[0] && existing[0].id) {
          try {
            await this.update(existing[0].id, d);
            success.push(d);
          } catch (error) {
            fail.push(error);
          }
        } else {
          try {
            const newSupplier = await this.create(d);
            supplierRepo.save(newSupplier);
            success.push(d);
          } catch (error) {
            fail.push(error);
          }
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
    console.log('create',data)
    const existingProducts = await this.search({ parentId: data.parentId });
    if (existingProducts.length) {
      throw new Error("Product with given parentId already exists");
    }
    const supplierRepo = this.manager_.withRepository(
      this.supplierProductRepository
    );
    const newSupplier = await supplierRepo.create(data);
    return await supplierRepo.save(newSupplier);
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
