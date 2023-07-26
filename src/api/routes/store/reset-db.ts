import { createConnection } from "typeorm";
import { Request, Response } from "express";

export default async (req: Request, res: Response): Promise<void> => {
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

    console.log("Connected to the database!");

    // You can now execute queries
    const data = await connection.query(
      `
      DELETE FROM public.fulfillment_item;
      DELETE FROM public.fulfillment;
    DELETE FROM public.product_option_value;
    DELETE FROM public.product_option;
    DELETE FROM public.line_item_tax_line;
    DELETE FROM public.line_item;
    DELETE FROM public.product_variant;
    DELETE FROM public.product;`
    );

    // Close the connection when you're done
    await connection.close();

    res.json({
      status: 200,
      message: "syncing finished successfully",
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
