import { Request, Response } from "express";
import { Order, Article } from "models/wms/types";

const getSuggestedArticleQuantityToPurchase = (
  quantityInStock,
  quantityInOrders
) => {
  const diff = quantityInStock - quantityInOrders;
  return diff < 0 ? Math.abs(diff) : 0;
};

const getArticleQuantityInWarehouse = (inventoryPerWarehouse) => {
  return inventoryPerWarehouse.reduce((total, element) => {
    return total + element.numberOfItems;
  }, 0);
};

const getAllArticlesInOrders = (orders) => {
  const articles = [];
  const articleNumbers = new Set();

  for (const order of orders) {
    for (const orderLine of order.orderLines) {
      const article = orderLine.article;
      if (article) {
        articles.push(article);
        articleNumbers.add(article.articleNumber);
      }
    }
  }

  return articles;
};

const getArticleName = (articles, articleInventory) => {
  const article = articles.find(
    (article) => article.articleNumber === articleInventory.articleNumber
  );
  return article ? article.articleName : "";
};

export default async (req, res) => {
  const wmsService = req.scope.resolve("wmsService");
  const orders = await wmsService.getOrders();
  const articles = getAllArticlesInOrders(orders.data);
  const articleNumbers = articles.map((article) => article.articleNumber);
  const articlesInventoryPerWarehouse =
    await wmsService.getArticleInventoryPerWarehouse(articleNumbers);

  const data = articlesInventoryPerWarehouse
    .map((articleInventory) => {
      const productQuantity = getSuggestedArticleQuantityToPurchase(
        getArticleQuantityInWarehouse(articleInventory.inventoryPerWarehouse),
        articleNumbers.filter(
          (articleNumber) => articleNumber === articleInventory.articleNumber
        ).length
      );
      const productName = getArticleName(articles, articleInventory);
      const stock = getArticleQuantityInWarehouse(
        articleInventory.inventoryPerWarehouse
      );

      return {
        productReference: articleInventory.articleNumber,
        productQuantity,
        productName,
        stock,
      };
    })
    .filter((item) => item.productQuantity > 0);

  res.json({
    status: 200,
    data,
  });
};
