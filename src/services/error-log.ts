import { TransactionBaseService } from "@medusajs/medusa";
import ErrorLogRepository from "../repositories/error-log";

class ErrorLogService extends TransactionBaseService {
  protected readonly errorLogRepository: typeof ErrorLogRepository;

  constructor({ errorLogRepository, manager }) {
    super({ errorLogRepository, manager });
    this.errorLogRepository = errorLogRepository;
    this.manager_ = manager;
  }

  async create(data) {
    const repo = this.manager_.withRepository(this.errorLogRepository);
    const newItem = repo.create(data);
    return repo.save(newItem);
  }

  async findOne(id) {
    const repo = this.manager_.withRepository(this.errorLogRepository);
    return repo.findOne(id);
  }

  async update(id, data) {
    const repo = this.manager_.withRepository(this.errorLogRepository);
    const errorLog = await repo.findOne(id);
    if (!errorLog) {
      throw new Error("Supplier not found");
    }
    repo.merge(errorLog, data);
    return repo.save(errorLog);
  }

  async delete(id) {
    const repo = this.manager_.withRepository(this.errorLogRepository);
    const errorLog = await repo.findOne(id);
    if (!errorLog) {
      throw new Error("errorLog not found");
    }
    return repo.remove(errorLog);
  }

  async list() {
    const repo = this.manager_.withRepository(this.errorLogRepository);
    return repo.find();
  }
}

export default ErrorLogService;
