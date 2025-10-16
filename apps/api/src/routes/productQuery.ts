import express, { Request, Response } from 'express';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all goods');
    const productRows = await db.execute(sql`SELECT * FROM goods`);
    const allProducts = productRows.rows;

    console.log(`Successfully fetched ${allProducts.length} goods`);

    res.json(allProducts);
  } catch (err: any) {
    console.error('Error fetching goods:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch goods' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  const productId = req.params.id;
  try {
    console.log(`Fetching product by ID: ${productId}`);
    const product = await db.select().from(products).where(eq(products.id, parseInt(productId))).limit(1);

    if (product.length === 0) {
      console.warn(`Product not found for ID: ${productId}`);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`Successfully fetched product ID: ${productId}`);
    res.json(product[0]);
  } catch (err: any) {
    console.error(`Error fetching product ID ${productId}:`, err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    console.log(`Attempting to create product: ${req.body.name || 'N/A'}`);
    const { name, description, price, image, category } = req.body;

    if (!name || !description || !price) {
      console.warn('Product creation failed: Missing required fields (name, description, price).');
      return res.status(400).json({ error: 'Name, description, and price are required' });
    }

    console.log('Inserting new product into database');
    const [newProduct] = await db.insert(products).values({
      name,
      description,
      price,
      image,
      category
    }).returning();

    console.log(`Successfully created product ID: ${newProduct.id} (Name: ${name})`);
    res.status(201).json(newProduct);
  } catch (err: any) {
    console.error('Error creating product:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
