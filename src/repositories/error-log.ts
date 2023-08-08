import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { ErrorLog } from "../models/error-log";

export const ErrorLogRepository = dataSource.getRepository(ErrorLog);

export default ErrorLogRepository;
