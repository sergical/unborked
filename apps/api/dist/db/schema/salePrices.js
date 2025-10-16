"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleCategories = exports.productMetadata = exports.salePrices = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Poorly designed: Each sale price is a separate record
// This will cause N+1 queries when fetching sale products
exports.salePrices = (0, pg_core_1.pgTable)('sale_prices', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productId: (0, pg_core_1.integer)('product_id').notNull(), // No foreign key constraint - bad practice
    salePrice: (0, pg_core_1.decimal)('sale_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Poorly designed: Product metadata stored separately
// This forces additional joins to get complete product info
exports.productMetadata = (0, pg_core_1.pgTable)('product_metadata', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productId: (0, pg_core_1.integer)('product_id').notNull(), // No index here
    discount: (0, pg_core_1.decimal)('discount', { precision: 5, scale: 2 }),
    saleCategory: (0, pg_core_1.varchar)('sale_category', { length: 100 }), // Denormalized, requires string matching
    featured: (0, pg_core_1.boolean)('featured').default(false),
    priority: (0, pg_core_1.integer)('priority').default(0), // No index, will cause slow sorting
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Poorly designed: Sale categories stored separately
// This causes additional queries to match categories
exports.saleCategories = (0, pg_core_1.pgTable)('sale_categories', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 255 }),
    startDate: (0, pg_core_1.timestamp)('start_date').notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date').notNull(),
});
//# sourceMappingURL=salePrices.js.map