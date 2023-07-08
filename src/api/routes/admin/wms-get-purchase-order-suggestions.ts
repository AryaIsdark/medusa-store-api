import { Request, Response } from "express";
import { Order, Article } from "models/wms/types";

const getSuggestedArticleQuanitityToPurchase = (
  quantityInStock,
  quantityInOrders
) => {
  const diff = quantityInStock - quantityInOrders;
  if (diff < 0) {
    // if fx diff is -5 return 5 items to buy
    return Math.abs(diff);
  }
};

const getArticleQuantityInWarehouse = (inventoryPerWarehouse) => {
  return inventoryPerWarehouse.reduce((total, element) => {
    return total + element.numberOfItems;
  }, 0);
};

const getAllArticlesInOrders = (orders: Order[]) => {
  const articles: Article[] = [];
  const articleNumbers = new Set();

  orders.forEach((order) => {
    order.orderLines.forEach((orderLine) => {
      if (orderLine.article) {
        articles.push(orderLine.article);
        articleNumbers.add(orderLine.article.articleNumber);
      }
    });
  });

  return articles;
};

const getArticleName = (articles: Article[], articleInventory) => {
  const article = articles.find(
    (article) => article.articleNumber === articleInventory.articleNumber
  );
  return article ? article.articleName : "";
};

export default async (req: Request, res: Response) => {
  const wmsService = req.scope.resolve("wmsService");
  const orders = await wmsService.getOrders();
  const articles = getAllArticlesInOrders(orders.data);
  const articleNumbers = articles.map((article) => article.articleNumber);
  const articlesInventoryPerWarehouse =
    await wmsService.getArticleInventoryPerWarehouse(articleNumbers);

  const data = articlesInventoryPerWarehouse.map((articleInventory) => ({
    productReference: articleInventory.articleNumber,
    productQuantity: getSuggestedArticleQuanitityToPurchase(
      getArticleQuantityInWarehouse(articleInventory.inventoryPerWarehouse),
      articleNumbers.filter(
        (articleNumber) => articleNumber === articleInventory.articleNumber
      ).length
    ),
    productName: getArticleName(articles, articleInventory),
    stock: getArticleQuantityInWarehouse(
      articleInventory.inventoryPerWarehouse
    ),
  }));

  res.json({
    status: 200,
    data,
  });
};
