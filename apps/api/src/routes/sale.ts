import express, { Request, Response } from 'express';
import { db } from '../db';
import { products, salePrices, productMetadata, saleCategories } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Poorly designed endpoint - this looks innocent but will cause N+1 queries
router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching sale products');
    
    // Step 1: Get all products (looks reasonable)
    console.log('Fetching all products');
    const allProducts = await db.select().from(products);

    // Step 2: For EACH product, query sale prices individually (N+1 problem!)
    const saleProducts: any[] = [];

    console.log(`Checking sale prices for ${allProducts.length} products`);

    // Load sale data for each product
    for (const product of allProducts) {
      // Individual query per product - this is the killer
      const salePrice = await db
        .select()
        .from(salePrices)
        .where(eq(salePrices.productId, product.id))
        .limit(1);

      if (salePrice.length > 0) {
        // Another individual query for metadata (double N+1!)
        const metadata = await db
          .select()
          .from(productMetadata)
          .where(eq(productMetadata.productId, product.id))
          .limit(1);

        // Yet another query to match category by string (triple whammy!)
        let categoryInfo = null;
        if (metadata.length > 0 && metadata[0].saleCategory) {
          const categoryResult = await db
            .select()
            .from(saleCategories)
            .where(eq(saleCategories.name, metadata[0].saleCategory))
            .limit(1);

          if (categoryResult.length > 0) {
            categoryInfo = categoryResult[0];
          }
        }

        saleProducts.push({
          ...product,
          originalPrice: product.price,
          salePrice: salePrice[0].salePrice,
          discount: metadata.length > 0 ? metadata[0].discount : null,
          saleCategory: metadata.length > 0 ? metadata[0].saleCategory : null,
          featured: metadata.length > 0 ? metadata[0].featured : false,
          priority: metadata.length > 0 ? metadata[0].priority : 0,
          categoryDescription: categoryInfo ? categoryInfo.description : null
        });
      }
    }

    // Sort by priority (no index on priority field, so this is slow)
    saleProducts.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    console.log(`Successfully fetched ${saleProducts.length} sale products after ${allProducts.length * 3} queries`);

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
