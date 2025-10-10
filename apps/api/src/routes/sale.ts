import express, { Request, Response } from 'express';
import { db } from '../db';
import { products, salePrices, productMetadata, saleCategories } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import * as Sentry from '@sentry/node';

const router = express.Router();

const { debug, info, warn, error, fmt } = Sentry.logger;

// Poorly designed endpoint - this looks innocent but will cause N+1 queries
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
        // Step 1: Get all products (looks reasonable)
        debug('Fetching all products');
        const allProducts = await db.select().from(products);

        span.setAttribute('products.total', allProducts.length);

        // Step 2: For EACH product, query sale prices individually (N+1 problem!)
        const saleProducts: any[] = [];

        debug(fmt`Checking sale prices for ${allProducts.length} products`);

        // Load sale data for each product
        await Sentry.startSpan(
          {
            op: 'db.query',
            name: 'Load Sale Data',
            attributes: {
              'products.count': allProducts.length
            }
          },
          async (saleDataSpan) => {
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

            saleDataSpan.setAttribute('queries.executed', allProducts.length * 3);
          }
        );

        // Sort by priority (no index on priority field, so this is slow)
        saleProducts.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        span.setAttribute('products.on_sale', saleProducts.length);
        info(fmt`Successfully fetched ${saleProducts.length} sale products after ${allProducts.length * 3} queries`);

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
