"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create a new purchase
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        console.log(`Attempting to create purchase for username: ${req.user?.username || 'N/A'}`);
        const { items, total } = req.body;
        if (!req.user) {
            console.warn('Purchase creation failed: User not authenticated.');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.userId;
        const username = req.user.username;
        console.log(`User authenticated for purchase: ${userId}`);
        if (!items || !total) {
            console.warn(`Purchase creation failed for user ${userId}: Missing required fields (items, total).`);
            return res.status(400).json({ error: 'Items and total are required' });
        }
        console.log(`Inserting purchase for user ${userId} into database`);
        const [purchase] = await db_1.db.insert(schema_1.purchases).values({
            userId,
            items,
            total
        }).returning();
        console.log(`Successfully created purchase ID: ${purchase.id} for user ID: ${userId}`);
        console.log(`${username} with user ID ${userId} successfully purchased ${items.length} items for ${total}`);
        res.status(201).json({
            message: 'Purchase successful',
            purchase
        });
    }
    catch (err) {
        console.error(`Error creating purchase for user ${req.user?.username || 'N/A'}:`, err.message, err.stack);
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});
// Get user purchase history
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        console.log(`Attempting to fetch purchase history for username: ${req.user?.username || 'N/A'}`);
        if (!req.user) {
            console.warn('Purchase history fetch failed: User not authenticated.');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.userId;
        console.log(`User authenticated for purchase history: ${req.user?.username || 'N/A'}`);
        console.log(`Fetching purchase history for user ${userId} from database`);
        const userPurchases = await db_1.db.select().from(schema_1.purchases).where((0, drizzle_orm_1.eq)(schema_1.purchases.userId, userId));
        console.log(`Successfully fetched ${userPurchases.length} purchase(s) for user ID: ${userId}`);
        res.json(userPurchases);
    }
    catch (err) {
        console.error(`Error fetching purchase history for user ${req.user?.username || 'N/A'}:`, err.message, err.stack);
        res.status(500).json({ error: 'Failed to fetch purchase history' });
    }
});
exports.default = router;
//# sourceMappingURL=purchases.js.map