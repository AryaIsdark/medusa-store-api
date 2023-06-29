export type OrderItem = {
  id: string;
  quantity: number;
};

export type ShippingAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  address_3?: string;
  postal_code: string;
  city: string;
  country_code: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
};

export type Cart = {
  shipping_address: ShippingAddress;
};

export type OrderLine = {
  rowNumber: string;
  articleNumber: string;
  numberOfItems: number;
  comment: string;
  shouldBePicked: boolean;
  serialNumber: string;
  lineTotalCustomsValue: number;
  batchNumber: string;
};

export type Consignee = {
  name: string;
  address1: string;
  address2: string;
  address3: string;
  postCode: string;
  city: string;
  countryCode: string;
  countryStateCode: string;
  remark: string;
  doorCode: string;
};

export type OrderData = {
  goodsOwnerId: string;
  orderNumber: string;
  deliveryDate: string;
  consignee: Consignee;
  orderLines: OrderLine[];
};
