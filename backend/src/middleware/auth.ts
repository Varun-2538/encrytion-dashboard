import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logError, logWarn, logDebug } from '../utils/logger';
import { AuthenticatedRequest, AuthUser } from '../types';

/**
 * Authentication middleware to verify Supabase access tokens
 * Validates JWT tokens and attaches user information to request
 */

/**
 * Extracts bearer token from Authorization header
 */
const extractBearerToken = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Middleware function to authenticate requests using Supabase JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      logWarn('AuthMiddleware', 'Missing or invalid Authorization header');
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid access token.'
      });
      return;
    }

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );

    // Verify the JWT token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logWarn('AuthMiddleware', `Token verification failed: ${error?.message || 'User not found'}`);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired access token.'
      });
      return;
    }

    // Attach user information to request
    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role: user.role
    };

    (req as AuthenticatedRequest).user = authUser;

    logDebug('AuthMiddleware', `User authenticated: ${user.email}`);
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('AuthMiddleware', `Authentication error: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.'
    });
  }
};

/**
 * Optional middleware to check if user has admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    logError('AuthMiddleware', 'requireAdmin called before authenticate middleware');
    res.status(500).json({
      success: false,
      error: 'Internal server error.'
    });
    return;
  }

  if (authReq.user.role !== 'admin') {
    logWarn('AuthMiddleware', `Access denied for user: ${authReq.user.email}`);
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
    return;
  }

  next();
};
