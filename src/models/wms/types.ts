export type WMSOrderLine = {
  rowNumber: string;
  articleName: string;
  articleNumber: string;
  numberOfItems: number;
  comment: string;
  shouldBePicked: boolean;
  serialNumber: string;
  lineTotalCustomsValue: number;
  batchNumber: string;
  ean: string;
  barcode: string;
};

export type WMSConsignee = {
  name: string;
  address1: string;
  address2: string;
  postCode: string;
  city: string;
  countryCode: string;
  countryStateCode: string;
  remark: string;
  doorCode: string;
};

export type WMSOrderData = {
  goodsOwnerId: string;
  orderNumber: string;
  deliveryDate: string;
  consignee: WMSConsignee;
  orderLines: WMSOrderLine[];
};

export type OrderInfo = {
  orderId: number;
  orderNumber: string;
  goodsOwnerOrderId: string;
  referenceNumber: string;
  salesCode: string;
  orderRemark: string;
  deliveryInstruction: string;
  servicePointCode: string;
  freeText1: string;
  freeText2: string;
  freeText3: string;
  orderType: null | any;
  wayOfDelivery: null | any;
  deliveryDate: string;
  createdDate: string;
  shippedTime: null | any;
  wayBill: string;
  returnWayBill: string;
  orderStatus: {
    number: number;
    text: string;
  };
  emailNotification: {
    toBeNotified: boolean;
    value: string;
  };
  smsNotification: {
    toBeNotified: boolean;
    value: string;
  };
  telephoneNotification: {
    toBeNotified: boolean;
    value: string;
  };
  orderedNumberOfItems: number;
  allocatedNumberOfItems: number;
  pickedNumberOfItems: number;
  customsInfo: null | any;
  preparedTransportDocumentId: string;
  warehouse: null | any;
  termsOfDeliveryType: null | any;
  customerPrice: number;
  consigneeOrderNumber: string;
  warehouseInstruction: string;
  marketPlace: {
    marketPlace: string;
    marketPlaceOrderNumber: string;
  };
  pickingPriority: null | any;
  productionCode: string;
  advanced: {
    invoiceNumber: string;
    arrivalDate: null | any;
    deliveryDateWithTime: string;
    backOrderInfo: null | any;
  };
};

export type Consignee = {
  customerNumber: string;
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
  advanced: {
    telephoneNotification: {
      toBeNotified: boolean;
      value: string;
    };
    emailNotification: {
      toBeNotified: boolean;
      value: string;
    };
    smsNotification: {
      toBeNotified: boolean;
      value: string;
    };
  };
  invoiceAddress: null | any;
  id: number;
};

export type Article = {
  articleSystemId: number;
  articleNumber: string;
  articleName: string;
  productCode: string;
  articleKind: string;
};

export type OrderLine = {
  id: number;
  rowNumber: string;
  article: Article;
  comment: string;
  orderedNumberOfItems: number;
  allocatedNumberOfItems: number;
  pickedNumberOfItems: number;
  packedNumberOfItems: number;
  reportedNumberOfItems: null | any;
  shouldBePicked: boolean;
  pickedArticleItems: any[];
  subOrderLines: null | any;
  serialNumber: string;
  lineTotalCustomsValue: number;
  batchNumber: string;
  reportedReturnedNumberOfItems: null | any;
  lineType: null | any;
  prices: null | any;
  customerArticleNumber: string;
  externalId: string;
  returnedNumberOfItems: number;
  freeValues: null | any;
};

export type Order = {
  goodsOwner: {
    id: number;
    name: string;
  };
  orderInfo: OrderInfo;
  consignee: Consignee;
  parcels: any[];
  orderLines: OrderLine[];
  transporter: null | any;
  returnTransporter: null | any;
  tracking: null | any;
  classes: null | any;
  shipmentInfo: null | any;
};
