import { TransactionBaseService } from "@medusajs/medusa";
import SupplierProductVariantRepository from "../repositories/supplier-product";
import { SupplierProductVariant } from "models/supplier-product-variant";

class SupplierProductVariantService extends TransactionBaseService {
  protected readonly supplierProductVariantRepository: typeof SupplierProductVariantRepository;

  constructor({ supplierProductVariantRepository, manager }) {
    super({ supplierProductVariantRepository, manager });

    this.supplierProductVariantRepository = supplierProductVariantRepository;
    this.manager_ = manager;
  }

  async update(id, data: Partial<SupplierProductVariant>) {
    const repo = this.manager_.withRepository(
      this.supplierProductVariantRepository
    );
    const variant = await repo.findOne({ where: { id } });
    if (!variant) {
      throw new Error("variant not found");
    }
    repo.merge(variant, data);
    return repo.save(variant);
  }

  async create(data: SupplierProductVariant) {
    const existingProducts = await this.search({ sku: data.sku });

    if (existingProducts.length) {
      throw new Error("Product with given SKU already exists");
    }
    const repo = this.manager_.withRepository(
      this.supplierProductVariantRepository
    );
    const newSupplierProductVariant = repo.create(data);
    return repo.save(newSupplierProductVariant);
  }

  async search(query: Partial<SupplierProductVariant>) {
    const repo = this.manager_.withRepository(
      this.supplierProductVariantRepository
    );
    return repo.find({ where: query });
  }
}

export default SupplierProductVariantService;
