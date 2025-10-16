import express, { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log(`Registration attempt for username: ${req.body.username}`);
    const { username, password } = req.body;

    if (!username || !password) {
      console.warn('Registration failed: Username or password missing.');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    console.log(`Checking existence for username: ${username}`);
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (existingUser.length > 0) {
      console.warn(`Registration failed: Username already exists: ${username}`);
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    console.log(`Creating new user: ${username}`);
    const [newUser] = await db.insert(users).values({
      username,
      password, // In a real app, this would be hashed
    }).returning();

    console.log(`User registered successfully: ${username} (ID: ${newUser.id})`);

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id
    });
  } catch (err: any) {
    console.error(`Registration error for ${req.body.username}:`, err.message, err.stack);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log(`Login attempt for username: ${req.body.username}`);
    const { username, password } = req.body;

    if (!username || !password) {
      console.warn('Login failed: Username or password missing.');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    console.log(`Attempting to find user: ${username}`);
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (user.length === 0 || user[0].password !== password) {
      console.warn(`Login failed: Invalid credentials for username: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    console.log(`Generating JWT for user ID: ${user[0].username}`);
    const token = jwt.sign(
      {
        userId: user[0].id,
        username: user[0].username,
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    console.log(`User logged in successfully: ${username} (ID: ${user[0].username})`);

    res.json({
      token,
      user: {
        id: user[0].id,
        username: user[0].username,
      },
    });
  } catch (err: any) {
    console.error(`Login error for ${req.body.username}:`, err.message, err.stack);
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;
