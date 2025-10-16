import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();

const PORT = 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4173';

const corsOptions = {
  origin: [FRONTEND_URL],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'sentry-trace',
    'baggage'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url} - Request received`);
  next();
});

// Routes
app.use('/api', routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error occurred:', err.message, err.stack);
  
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');

    // Start server
    console.log('About to call app.listen on port', PORT);
    app.listen(PORT, () => {
      console.log('✅ Server is running on port', PORT);
      console.log(`🔗 Allowed frontend origin: ${FRONTEND_URL}`);
    });

  } catch (startupError: any) {
    console.error('❌ Failed to start server:', startupError.message, startupError.stack);
    process.exit(1);
  }
};

startServer();