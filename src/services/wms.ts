import axios, { AxiosResponse, AxiosRequestConfig, AxiosHeaders } from "axios";
import {
  ProductVariant,
  ProductVariantService,
  TransactionBaseService,
  Order,
  Cart,
  LineItem,
  FulfillmentService,
  OrderService,
} from "@medusajs/medusa";
import { WMSOrderLine, WMSConsignee, WMSOrderData } from "models/wms/types";
import { CreateFulfillmentOrder } from "@medusajs/medusa/dist/types/fulfillment";
import { URLSearchParams } from "url";

class WmsService extends TransactionBaseService {
  private readonly WMS_BASE_API: string;
  private readonly WMS_GOODS_OWNER_ID: string;
  private readonly WMS_AUTHENTICATION: string;
  private readonly headerConfig: AxiosRequestConfig;
  productVariantService: ProductVariantService;
  fulfillmentService: FulfillmentService;
  orderService: OrderService;

  constructor(container) {
    super(container);
    // Services
    this.productVariantService = container.productVariantService;
    this.fulfillmentService = container.fulfillmentService;
    this.orderService = container.orderService;

    // Configs
    this.WMS_BASE_API = process.env.WMS_BASE_API || "";
    this.WMS_GOODS_OWNER_ID = process.env.WMS_GOODS_OWNER_ID || "";
    this.WMS_AUTHENTICATION = process.env.WMS_AUTHENTICATION || "";

    this.headerConfig = {
      headers: {
        Authorization: this.WMS_AUTHENTICATION,
      },
    };
  }

  private getConsigneePayload = (cart: Cart): WMSConsignee => {
    return {
      name:
        cart.shipping_address.first_name +
        " " +
        cart.shipping_address.last_name,
      address1: cart.shipping_address.address_1,
      address2: cart.shipping_address.address_2,
      postCode: cart.shipping_address.postal_code,
      city: cart.shipping_address.city,
      countryCode: cart.shipping_address.country_code,
      countryStateCode: cart.shipping_address.country_code,
      remark: "",
      doorCode: "",
    };
  };

  private createOrderLinePayload = async (orderItems: LineItem[]) => {
    const orderLines: WMSOrderLine[] = await Promise.all(
      orderItems.map(async (item) => {
        const productVariant = await this.productVariantService.retrieve(
          item.variant_id
        );

        return {
          rowNumber: item.id,
          articleName: productVariant.title,
          articleNumber: productVariant.sku || "SKU not available",
          barcode: productVariant.barcode || "Barcode not available",
          ean: productVariant.ean || "EAN not available",
          numberOfItems: item.quantity,
          comment: "no comments",
          shouldBePicked: true,
          serialNumber: "string",
          lineTotalCustomsValue: 0,
          batchNumber: "string",
        };
      })
    );

    return orderLines;
  };

  private async createOrderPayload(
    order: Order,
    cart: Cart
  ): Promise<WMSOrderData> {
    const orderLines = await this.createOrderLinePayload(order.items);
    const consignee = this.getConsigneePayload(cart);

    console.log("olololololololololo", orderLines);

    const orderData: WMSOrderData = {
      goodsOwnerId: this.WMS_GOODS_OWNER_ID,
      orderNumber: order.id,
      deliveryDate: "2023-07-24",
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

  public getProductVariant = async (variantId: string) => {
    return await this.productVariantService.retrieve(variantId);
  };

  public async submitOrder(order: Order, cart: Cart): Promise<AxiosResponse> {
    const payload = await this.createOrderPayload(order, cart);
    const url = `${this.WMS_BASE_API}/orders`;
    return await axios.put(url, payload, this.headerConfig);
  }

  public async createArticles(productVariants: ProductVariant[]) {
    const url = `${this.WMS_BASE_API}/articles`;
    const successfulItems = [];
    const unsuccessfulItems = [];
    const requests = productVariants.map((productVariant) => {
      const wmsArticle = {
        goodsOwnerId: this.WMS_GOODS_OWNER_ID,
        articleNumber: productVariant.sku,
        articleName: `${productVariant.title}`,
        productCode: productVariant.ean || "product code not available",
        barCodeInfo: {
          barcode: productVariant.barcode,
        },
        weight: productVariant.weight,
        height: productVariant.height,
      };

      return axios
        .put(url, wmsArticle, this.headerConfig)
        .then((res) =>
          successfulItems.push({ item: productVariant, wmsResponse: res.data })
        )
        .catch((err) =>
          unsuccessfulItems.push({ item: productVariant, wsmError: err })
        );
    });

    const results = await Promise.all(requests);

    return { results, successfulItems, unsuccessfulItems };
  }

  public getWmsOrder = async (wmsOrderId: string) => {
    const url = `${this.WMS_BASE_API}/orders/${wmsOrderId}`;
    return await axios.get(url, this.headerConfig);
  };

  public createFulfillment = async (wmsOrderNumber: string) => {
    this.orderService.retrieve(wmsOrderNumber).then((order) => {
      console.log(order);
      // const fulFillmentOrder: CreateFulfillmentOrder = {
      //   ...order,
      //   is_claim: false,
      //   email: order.email,
      //   payments: [],
      //   discounts: [],
      //   currency_code: order.currency.code,
      //   tax_rate: order.tax_rate || null,
      //   region_id: order.region_id,
      //   region: order.region,
      //   is_swap: false,
      //   display_id: order.display_id,
      //   billing_address: order.billing_address,
      //   items: order.items,
      //   shipping_methods: order.shipping_methods,
      //   no_notification: order.no_notification,
      //   claim_items: [],
      //   additional_items: [],
      //   type: null,
      //   order_id: order.id,
      //   return_order: null,
      //   refund_amount: null,
      //   deleted_at: null,
      //   updated_at: null,
      // };
      // this.fulfillmentService
      // .createFulfillment(fulFillmentOrder, [])
      // .then((fulfillmentRes) => console.log("fulfillmentRes", fulfillmentRes))
      // .catch((err) => console.log("eeeeeeeeeeeeeeeeeeee", console.error()));
    });
  };

  public getOrders = async () => {
    const url = `${this.WMS_BASE_API}/orders?goodsOwnerId=${this.WMS_GOODS_OWNER_ID}&maxOrdersToGet=100`;
    return await axios.get(url, this.headerConfig);
  };

  public getArticleInventoryPerWarehouse_dep = async (
    articleNumbers: string[]
  ) => {
    const serializedArticleNumbers = articleNumbers.join(",");
    const url = `${this.WMS_BASE_API}/articles/inventoryPerWarehouse?goodsOwnerId=${this.WMS_GOODS_OWNER_ID}&maxOrdersToGet=100&articleNumbers=${serializedArticleNumbers}`;
    return await axios.get(url, this.headerConfig);
  };

  public getArticleInventoryPerWarehouse = async (articleNumbers: string[]) => {
    const url = `${this.WMS_BASE_API}/articles/inventoryPerWarehouse`;
    const params = new URLSearchParams();
    params.append("goodsOwnerId", this.WMS_GOODS_OWNER_ID);
    params.append("maxOrdersToGet", "100");
    articleNumbers.forEach((number, index) =>
      params.append(`articleNumbers[${index}]`, number)
    );

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: this.WMS_AUTHENTICATION,
        },
        params: Object.fromEntries(params),
      });
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
}

export default WmsService;
