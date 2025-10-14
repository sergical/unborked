import express, { Request, Response } from 'express';
import { db } from '../db';
import { products, salePrices, productMetadata, saleCategories } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import * as Sentry from '@sentry/node';

const router = express.Router();

const { debug, info, warn, error, fmt } = Sentry.logger;

// Optimized endpoint - uses a single query with JOINs instead of N+1 queries
router.get('/', async (_req: Request, res: Response) => {
  return await Sentry.startSpan(
    {
      op: 'sale.list',
      name: 'List Sale Products',
      attributes: {
        'endpoint': '/sale',
        'method': 'GET'
      }
    },
    async (span) => {
      info('Fetching sale products');
      try {
        // Optimized: Single query with JOINs to fetch all related data at once
        debug('Fetching sale products with optimized query');

        const saleProducts: any[] = [];

        // Load sale data with a single optimized query using JOINs
        await Sentry.startSpan(
          {
            op: 'db.query',
            name: 'Load Sale Data',
            attributes: {}
          },
          async (saleDataSpan) => {
            // Single query with LEFT JOINs to get all data at once
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
                // Category description
                categoryDescription: saleCategories.description
              })
              .from(products)
              .leftJoin(salePrices, eq(products.id, salePrices.productId))
              .leftJoin(productMetadata, eq(products.id, productMetadata.productId))
              .leftJoin(saleCategories, eq(productMetadata.saleCategory, saleCategories.name))
              .where(sql`${salePrices.salePrice} IS NOT NULL`);

            span.setAttribute('products.total', results.length);

            // Transform the results to match the expected format
            for (const row of results) {
              saleProducts.push({
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
              });
            }

            saleDataSpan.setAttribute('queries.executed', 1);
          }
        );

        // Sort by priority
        saleProducts.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        span.setAttribute('products.on_sale', saleProducts.length);
        info(fmt`Successfully fetched ${saleProducts.length} sale products with 1 optimized query`);

        res.json(saleProducts);
        return saleProducts;
      } catch (err: any) {
        error(fmt`Error fetching sale products: ${err.message}`, { stack: err.stack });
        span.setAttributes({
          'error': true,
          'error.message': err instanceof Error ? err.message : 'Unknown error'
        });
        Sentry.captureException(err);
        res.status(500).json({ error: 'Failed to fetch sale products' });
        throw err;
      }
    }
  );
});

// Shop endpoint - slightly better but still inefficient
router.get('/shop', async (_req: Request, res: Response) => {
  return await Sentry.startSpan(
    {
      op: 'shop.list',
      name: 'List Shop Products',
      attributes: {
        'endpoint': '/sale/shop',
        'method': 'GET'
      }
    },
    async (span) => {
      info('Fetching shop products');
      try {
        // Get all products with a single query (this part is fine)
        const allProducts = await db.select().from(products);

        span.setAttribute('products.count', allProducts.length);
        info(fmt`Successfully fetched ${allProducts.length} shop products`);

        res.json(allProducts);
        return allProducts;
      } catch (err: any) {
        error(fmt`Error fetching shop products: ${err.message}`, { stack: err.stack });
        span.setAttributes({
          'error': true,
          'error.message': err instanceof Error ? err.message : 'Unknown error'
        });
        Sentry.captureException(err);
        res.status(500).json({ error: 'Failed to fetch shop products' });
        throw err;
      }
    }
  );
});

export default router;
