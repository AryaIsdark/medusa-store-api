import { Request, Response } from "express";
import { Order, Article } from "models/wms/types";

const getArticleQuantity = (inventoryPerWarehouse) => {
  return inventoryPerWarehouse.reduce((total, element) => {
    return total + element.numberOfItems;
  }, 0);
};

const getAllArticlesInOrders = (orders: Order[]) => {
  const articles: Article[] = [];
  const articleNumbers = new Set();

  orders.forEach((order) => {
    order.orderLines.forEach((orderLine) => {
      if (
        orderLine.article &&
        !articleNumbers.has(orderLine.article.articleNumber)
      ) {
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
    productQuantity: getArticleQuantity(articleInventory.inventoryPerWarehouse),
    productName: getArticleName(articles, articleInventory),
  }));

  res.json({
    status: 200,
    data,
  });
};
