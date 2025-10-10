import { pgTable, serial, integer, decimal, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

// Poorly designed: Each sale price is a separate record
// This will cause N+1 queries when fetching sale products
export const salePrices = pgTable('sale_prices', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(), // No foreign key constraint - bad practice
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Poorly designed: Product metadata stored separately
// This forces additional joins to get complete product info
export const productMetadata = pgTable('product_metadata', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(), // No index here
  discount: decimal('discount', { precision: 5, scale: 2 }),
  saleCategory: varchar('sale_category', { length: 100 }), // Denormalized, requires string matching
  featured: boolean('featured').default(false),
  priority: integer('priority').default(0), // No index, will cause slow sorting
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Poorly designed: Sale categories stored separately
// This causes additional queries to match categories
export const saleCategories = pgTable('sale_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
});
