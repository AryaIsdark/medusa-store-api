export const exchangeRates = {
  eur_to_sek: 11.68,
};

export const roundToNearestRoundValue = (price: number) => {
  console.log("price", price);
  const nonDecimalPart = Math.ceil(price);
  const decimalPart = 0.9;
  const roundedValue = nonDecimalPart + decimalPart;
  return roundedValue;
};

export const trimDecimals = (price: number) => parseFloat(price.toFixed(2));
