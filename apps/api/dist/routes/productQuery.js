"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        console.log('Fetching all goods');
        const productRows = await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM goods`);
        const allProducts = productRows.rows;
        console.log(`Successfully fetched ${allProducts.length} goods`);
        res.json(allProducts);
    }
    catch (err) {
        console.error('Error fetching goods:', err.message, err.stack);
        res.status(500).json({ error: 'Failed to fetch goods' });
    }
});
// Get product by ID
router.get('/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        console.log(`Fetching product by ID: ${productId}`);
        const product = await db_1.db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, parseInt(productId))).limit(1);
        if (product.length === 0) {
            console.warn(`Product not found for ID: ${productId}`);
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log(`Successfully fetched product ID: ${productId}`);
        res.json(product[0]);
    }
    catch (err) {
        console.error(`Error fetching product ID ${productId}:`, err.message, err.stack);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
router.post('/', async (req, res) => {
    try {
        console.log(`Attempting to create product: ${req.body.name || 'N/A'}`);
        const { name, description, price, image, category } = req.body;
        if (!name || !description || !price) {
            console.warn('Product creation failed: Missing required fields (name, description, price).');
            return res.status(400).json({ error: 'Name, description, and price are required' });
        }
        console.log('Inserting new product into database');
        const [newProduct] = await db_1.db.insert(schema_1.products).values({
            name,
            description,
            price,
            image,
            category
        }).returning();
        console.log(`Successfully created product ID: ${newProduct.id} (Name: ${name})`);
        res.status(201).json(newProduct);
    }
    catch (err) {
        console.error('Error creating product:', err.message, err.stack);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
exports.default = router;
//# sourceMappingURL=productQuery.js.map