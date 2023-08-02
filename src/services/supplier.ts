import { TransactionBaseService } from "@medusajs/medusa";
import SupplierRepository from "../repositories/supplier";
import SupplierProductService from "./supplier-product";
import SupplierProductVariantService from "./supplier-product-variant";
import { SupplierProduct } from "models/supplier-product";
import { SupplierProductVariant } from "models/supplier-product-variant";

class SupplierService extends TransactionBaseService {
  protected readonly supplierRepository: typeof SupplierRepository;
  private supplierProductService: SupplierProductService;
  private supplierProductVariantService: SupplierProductVariantService;

  constructor(container, { supplierRepository, manager }) {
    super(container);
    this.supplierRepository = supplierRepository;
    this.manager_ = manager;
    // Services
    this.supplierProductService = container.supplierProductService;
    this.supplierProductVariantService =
      container.supplierProductVariantService;
  }

  async getParentProduct(productVariant) {
    const searchResult = await this.supplierProductService.search({
      parentId: productVariant.parentId,
    });
    if (searchResult.length) {
      return searchResult[0];
    }

    return null;
  }

  async findVariant(variant: SupplierProductVariant) {
    const searchResult = await this.supplierProductVariantService.search({
      sku: variant.sku,
    });

    if (searchResult) {
      return searchResult[0];
    }

    return null;
  }

  async updateSupplierProductVariant(variant) {
    const supplierProductVariant = await this.findVariant(variant);
    if (supplierProductVariant.id) {
      return await this.supplierProductVariantService.update(
        supplierProductVariant.id,
        variant
      );
    }
  }

  async createSuppliarProductVariant(variant, supplier_product_id) {
    const result = await this.supplierProductVariantService.create({
      ...variant,
      supplier_product_id,
    });
    return result;
  }

  async isProductExistingInSupplierProductVariants(product) {
    const searchResult = await this.supplierProductVariantService.search({
      sku: product.sku,
    });
    return searchResult.length > 0;
  }

  async isProductExistingInSupplierProducts(product) {
    const searchResult = await this.supplierProductService.search({
      parentId: product.parentId,
    });
    return searchResult.length > 0;
  }

  async syncVariants(variants: SupplierProduct[]) {
    const visitedVariants = new Set();
    // For each product
    for (const variant of variants) {
      const isProductVariantExisting =
        await this.isProductExistingInSupplierProductVariants(variant);

      if (isProductVariantExisting) {
        await this.updateSupplierProductVariant(variant);
      }

      if (isProductVariantExisting === false) {
        if (visitedVariants.has(variant.sku) === false) {
          // find the parent product by parentId from the supplier_product table
          const parentProduct = await this.getParentProduct(variant);
          // create that product in the supplier_product_variant table with the supplier_product_id foreign key
          await this.createSuppliarProductVariant(variant, parentProduct.id);
        }
      }

      visitedVariants.add(variant.sku);
    }
  }

  async syncProducts(products: SupplierProduct[]) {
    const visitedParentIds = new Set();
    for (const product of products) {
      // If product does not already exist in supplier_product table
      const isProductExisting = await this.isProductExistingInSupplierProducts(
        product
      );

      if (isProductExisting) {
        // update product
      }
      // If Product does not already exist in supplier_product_variant table
      if (isProductExisting === false) {
        // If visitedParentIds does not contain product
        if (visitedParentIds.has(product.parentId) === false) {
          // Add product to supplier_product table
          await this.supplierProductService.create(product);
        }
      }

      visitedParentIds.add(product.parentId);
    }
  }

  async syncSupplierProducts(supplierProducts: SupplierProduct[]) {
    try {
      await this.syncProducts(supplierProducts);
      await this.syncVariants(supplierProducts);
    } catch (e) {}
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
