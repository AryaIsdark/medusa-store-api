import stringSimilarity from "string-similarity";

const isPriceRangeGreaterThanX = (priceA, priceB, x = 10) => {
  const priceRange = Math.abs(priceA - priceB);
  return priceRange > x;
};

const haveSimilarNames = (stringA = "", stringB = "") =>
  stringSimilarity.compareTwoStrings(
    stringA.toLowerCase(),
    stringB.toLowerCase()
  ) >= 0.69;

const isVariant = (productA, productB) => {
  if (productA.brand !== productB.brand) {
    return false;
  }

  if (isPriceRangeGreaterThanX(productA.rpr, productB.rpr)) {
    false;
  }

  if (!haveSimilarNames(productA.productName, productB.productName)) {
    return false;
  }

  return true;
};

const removeDuplicateObjects = (list, key) => {
  const seenIds = new Set();
  return list.filter((obj) => {
    const objKey = obj[key];
    if (!seenIds.has(objKey)) {
      seenIds.add(objKey);
      return true;
    }
    return false;
  });
};

export const groupProductsByVariants = (products) => {
  let groupedProducts = [];
  const visitedIds = new Set();
  products.forEach((product) => {
    const variants = products.filter((p) => {
      if (!visitedIds.has(p.sku) && isVariant(product, p)) {
        return p;
      }
    });

    const prunedVariants = removeDuplicateObjects(variants, "sku");

    groupedProducts.push({
      id: product.productName,
      numberOfVariants: prunedVariants.length,
      variants: prunedVariants,
    });

    variants.forEach((variant) => {
      visitedIds.add(variant.sku);
    });
  });

  return groupedProducts.filter((product) => !!product.variants.length);
};
