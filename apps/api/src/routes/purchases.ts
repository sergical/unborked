import express, { Request, Response } from 'express';
import { db } from '../db';
import { purchases } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

// Define interface for authorized request with user
interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    [key: string]: any;
  };
}

const router = express.Router();

// Create a new purchase
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    const [purchase] = await db.insert(purchases).values({
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
  } catch (err: any) {
    console.error(`Error creating purchase for user ${req.user?.username || 'N/A'}:`, err.message, err.stack);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Get user purchase history
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log(`Attempting to fetch purchase history for username: ${req.user?.username || 'N/A'}`);
    
    if (!req.user) {
      console.warn('Purchase history fetch failed: User not authenticated.');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.userId;
    console.log(`User authenticated for purchase history: ${req.user?.username || 'N/A'}`);

    console.log(`Fetching purchase history for user ${userId} from database`);
    const userPurchases = await db.select().from(purchases).where(eq(purchases.userId, userId));
    
    console.log(`Successfully fetched ${userPurchases.length} purchase(s) for user ID: ${userId}`);

    res.json(userPurchases);
  } catch (err: any) {
    console.error(`Error fetching purchase history for user ${req.user?.username || 'N/A'}:`, err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
});

export default router;
