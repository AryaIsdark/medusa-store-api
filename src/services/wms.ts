import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { Order, Cart, OrderLine, Consignee, OrderData } from "models/wms/types";

class WmsService {
  private readonly WMS_BASE_API: string;
  private readonly WMS_GOODS_OWNER_ID: string;
  private readonly WMS_AUTHENTICATION: string;
  private readonly headerConfig: AxiosRequestConfig;

  constructor() {
    this.WMS_BASE_API = process.env.WMS_BASE_API || "";
    this.WMS_GOODS_OWNER_ID = process.env.WMS_GOODS_OWNER_ID || "";
    this.WMS_AUTHENTICATION = process.env.WMS_AUTHENTICATION || "";

    this.headerConfig = {
      headers: {
        Authorization: this.WMS_AUTHENTICATION,
      },
    };
  }

  private createOrderObj(order: Order, cart: Cart): OrderData {
    const orderLines: OrderLine[] = order.items.map((item) => ({
      rowNumber: item.id,
      articleNumber: "random article number",
      numberOfItems: item.quantity,
      comment: "no comments",
      shouldBePicked: true,
      serialNumber: "string",
      lineTotalCustomsValue: 0,
      batchNumber: "string",
    }));

    const shippingAddress = cart.shipping_address;
    const consignee: Consignee = {
      name: shippingAddress.first_name + " " + shippingAddress.last_name,
      address1: shippingAddress.address_1,
      address2: shippingAddress.address_2,
      address3: shippingAddress.address_3 || "",
      postCode: shippingAddress.postal_code,
      city: shippingAddress.city,
      countryCode: shippingAddress.country_code,
      countryStateCode: shippingAddress.country_code,
      remark: "",
      doorCode: "",
    };

    const orderData: OrderData = {
      goodsOwnerId: this.WMS_GOODS_OWNER_ID,
      orderNumber: order.id,
      deliveryDate: "2023-06-24",
      consignee,
      orderLines,
    };

    return orderData;
  }

  public async checkItemAvailability(
    articleNumber: string
  ): Promise<AxiosResponse> {
    const url = `${this.WMS_BASE_API}/articles?goodsOwnerId=${this.WMS_GOODS_OWNER_ID}&articleNumber=${articleNumber}`;
    return await axios.get(url, this.headerConfig);
  }

  public async submitOrder(order: Order, cart: Cart): Promise<AxiosResponse> {
    const orderData = this.createOrderObj(order, cart);
    const url = `${this.WMS_BASE_API}/orders`;
    return await axios.put(url, orderData, this.headerConfig);
  }
}

export default WmsService;
