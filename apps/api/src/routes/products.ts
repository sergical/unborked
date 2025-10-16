import express, { Request, Response } from 'express';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all products (efficient V1)');
    const productRows = await db.execute(sql`SELECT * FROM products`);
    const allProducts = productRows.rows;

    console.log(`Successfully fetched ${allProducts.length} products (V1)`);
    res.json(allProducts);
  } catch (err: any) {
    console.error('Error fetching products (V1):', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

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

// Search with simple autocomplete. Intentionally optimized path may error in some cases.
router.get('/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  const isAutocomplete = String(req.query.autocomplete || '0') === '1';
  const limit = Math.min(parseInt(String(req.query.limit || '8'), 10) || 8, 25);

  if (!q) {
    return res.json([]);
  }

  try {
    // For autocomplete we try a faster path (may not be fully compatible across envs)
    if (isAutocomplete && q.length >= 2) {
      // Intentionally fragile query resembling an optimization that can fail depending on schema
      // SELECT distinct title to simulate a different column name in some setups
      const result = await db.execute(sql`
        SELECT DISTINCT title AS name
        FROM products
        WHERE title ILIKE ${'%' + q + '%'}
        ORDER BY title ASC
        LIMIT ${limit}
      `);
      const suggestions = result.rows.map((r: any) => r.name).filter(Boolean);
      return res.json(suggestions);
    }

    // Fallback search path
    const result = await db.execute(sql`
      SELECT id, name, price, image, category
      FROM products
      WHERE name ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'}
      ORDER BY name ASC
      LIMIT ${limit}
    `);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('Error searching products:', err.message, err.stack);
    return res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
