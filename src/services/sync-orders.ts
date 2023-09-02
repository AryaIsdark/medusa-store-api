import { CartService, OrderService, TransactionBaseService } from "@medusajs/medusa";
import ErrorLogService from "./error-log";
import WmsService from "./wms";

const desiredHour = 15;
const desiredMinute = 0;
const desiredSecond = 0;
const desiredMillisecond = 0;

// Create a new Date object
const currentDate = new Date();

// Set the desired time
currentDate.setHours(desiredHour, desiredMinute, desiredSecond, desiredMillisecond);

// Format the date to the desired format: "YYYY-MM-DDTHH:MM:SS.mmmZ"
const formattedDate = currentDate.toISOString();

class SyncOrdersService extends TransactionBaseService {
  private errorLogService: ErrorLogService;
  private orderService: OrderService;
  private cartService: CartService;
  private wmsService: WmsService

  constructor(container) {
    super(container);
    // Services
    this.errorLogService = container.errorLogService;
    this.orderService = container.orderService;
    this.cartService = container.cartService;
    this.wmsService = container.wmsService
  }
 
  async logError(entity_id, error) {
    return await this.errorLogService.create({
      entity_id: entity_id,
      error: JSON.stringify(error),
    });
  }

  public syncOrders = async () => {
  
    const orders = await this.orderService.list({ created_at: currentDate}, {skip: 0})

    await Promise.all(
      orders.map( async(order) => {
        try {
          const cart = await this.cartService.retrieveWithTotals(order.cart_id)
          this.wmsService.submitOrder(order, cart)
        }
        catch (e) {
          this.logError(order.id, e)
        }
      })
    );

    return orders;
  }
}

export default SyncOrdersService