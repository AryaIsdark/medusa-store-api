import { createConnection } from "typeorm";
import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
  const productName = req.query?.productName 
  try {
    // Create a connection
    const connection = await createConnection({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD, // Fix the typo here
      database: process.env.DATABASE_NAME,
      synchronize: true, // Set to true only for development, not in production
      entities: [], // Add your entity classes here (e.g., [__dirname + "/entities/*.js"])
    });
   
    const data = await connection.query(
      `
      SELECT *
      FROM product
      JOIN product_variant ON product.id = product_variant.product_id
      WHERE product.status = 'published'
      AND product_variant.title ILIKE '%${productName}%';`
    );

    // Close the connection when you're done
    await connection.close();

    res.json({
      status: 200,
      data,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: 500,
      error: e.message,
    });
  }
};
