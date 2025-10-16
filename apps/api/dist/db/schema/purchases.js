"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchasesRelations = exports.purchases = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
const drizzle_orm_1 = require("drizzle-orm");
exports.purchases = (0, pg_core_1.pgTable)('purchases', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => users_1.users.id).notNull(),
    items: (0, pg_core_1.jsonb)('items').notNull(),
    total: (0, pg_core_1.decimal)('total', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.purchasesRelations = (0, drizzle_orm_1.relations)(exports.purchases, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.purchases.userId],
        references: [users_1.users.id]
    })
}));
//# sourceMappingURL=purchases.js.map