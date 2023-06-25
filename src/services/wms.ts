import axios from "axios";

const WMS_BASE_API = process.env.WMS_BASE_API;
const WMS_GOODS_OWNER_ID = process.env.WMS_GOODS_OWNER_ID;
const WMS_AUTHENTICATION = process.env.WMS_AUTHENTICATION;
const headerConfig = {
  headers: {
    Authorization: WMS_AUTHENTICATION,
  },
};

const createOrderObj = (order, cart) => {
  const orderLines = order.items.map((item) => ({
    rowNumber: item.id,
    articleNumber: "random article number",
    numberOfItems: item.quantity,
    comment: "no comments",
    shouldBePicked: true,
    serialNumber: "string",
    lineTotalCustomsValue: 0,
    batchNumber: "string",
  }));
  const shipping_address = cart.shipping_address;
  const orderData = {
    goodsOwnerId: WMS_GOODS_OWNER_ID,
    orderNumber: order.id,
    deliveryDate: "2023-06-24",
    consignee: {
      name: shipping_address.first_name + "" + shipping_address.last_name,
      address1: shipping_address.address_1,
      address2: shipping_address.address_2,
      address3: shipping_address.address_3 || "",
      postCode: shipping_address.postal_code,
      city: shipping_address.city,
      countryCode: shipping_address.country_code,
      countryStateCode: shipping_address.country_code,
      remark: "",
      doorCode: "",
    },
    orderLines,
  };
  return orderData;
};

class WmsService {
  checkItemAvailibility = async (articleNumber) => {
    const url = `${WMS_BASE_API}/articles?goodsOwnerId=${WMS_GOODS_OWNER_ID}&articleNumber=${articleNumber}`;
    return await axios.get(url, headerConfig);
  };

  submitOrder = async (order, cart) => {
    const orderData = createOrderObj(order, cart);
    const url = `${WMS_BASE_API}/orders`;
    return await axios.put(url, orderData, headerConfig);
  };
}

export default WmsService;
