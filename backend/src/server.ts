import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import secretsRouter from './routes/secrets';
import { logInfo, logError } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logInfo('Server', `${req.method} ${req.path} - ${req.ip}`);
  next();
});

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Secrets Store API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/secrets', secretsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

/**
 * Global Error Handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logError('Server', `Unhandled error: ${err.message}`, err);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

/**
 * Server Startup
 */
const startServer = (): void => {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_KEY',
      'ENCRYPTION_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }

    // Start listening
    app.listen(PORT, () => {
      logInfo('Server', `Server is running on port ${PORT}`);
      logInfo('Server', `Environment: ${process.env.NODE_ENV || 'development'}`);
      logInfo('Server', `CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Server', `Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logError('Server', `Unhandled Rejection: ${reason}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logError('Server', 'Uncaught Exception', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
