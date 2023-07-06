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
