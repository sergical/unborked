"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCarts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.userCarts = (0, pg_core_1.pgTable)('user_carts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => users_1.users.id, { onDelete: 'cascade' }).unique(), // Add unique constraint
    cartData: (0, pg_core_1.jsonb)('cart_data').notNull().default('{}'), // Store cart as JSONB, default empty object
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
//# sourceMappingURL=userCarts.js.map