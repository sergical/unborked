import express, { Request, Response } from 'express';
import { db } from '../db';
import { products, salePrices, productMetadata, saleCategories } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

// Optimized endpoint - uses a single JOIN query to fetch all data at once
router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching sale products with optimized query');
    
    // Single query with JOINs to get all related data at once
    const results = await db
      .select({
        // Product fields
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        category: products.category,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Sale price fields
        salePrice: salePrices.salePrice,
        // Metadata fields
        discount: productMetadata.discount,
        saleCategory: productMetadata.saleCategory,
        featured: productMetadata.featured,
        priority: productMetadata.priority,
        // Category fields
        categoryDescription: saleCategories.description
      })
      .from(products)
      .innerJoin(salePrices, eq(products.id, salePrices.productId))
      .leftJoin(productMetadata, eq(products.id, productMetadata.productId))
      .leftJoin(saleCategories, eq(productMetadata.saleCategory, saleCategories.name))
      .orderBy(desc(productMetadata.priority));

    // Map results to the expected format
    const saleProducts = results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      image: row.image,
      category: row.category,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      originalPrice: row.price,
      salePrice: row.salePrice,
      discount: row.discount,
      saleCategory: row.saleCategory,
      featured: row.featured ?? false,
      priority: row.priority ?? 0,
      categoryDescription: row.categoryDescription
    }));

    console.log(`Successfully fetched ${saleProducts.length} sale products with a single optimized query`);

    res.json(saleProducts);
  } catch (err: any) {
    console.error('Error fetching sale products:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch sale products' });
  }
});

// Shop endpoint - slightly better but still inefficient
router.get('/shop', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching shop products');
    
    // Get all products with a single query (this part is fine)
    const allProducts = await db.select().from(products);

    console.log(`Successfully fetched ${allProducts.length} shop products`);

    res.json(allProducts);
  } catch (err: any) {
    console.error('Error fetching shop products:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch shop products' });
  }
});

export default router;
