import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';
import { logWarn } from '../utils/logger';

/**
 * Validation middleware for request data
 * Uses express-validator for input validation
 */

/**
 * Handles validation results and returns errors if any
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? (err as any).path : 'unknown',
      message: err.msg
    }));

    logWarn('ValidationMiddleware', `Validation failed: ${JSON.stringify(errorMessages)}`);

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
    return;
  }

  next();
};

/**
 * Validation rules for creating a new secret
 */
export const validateCreateSecret: ValidationChain[] = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Secret content is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Secret content must be between 1 and 10000 characters')
];

/**
 * Validation rules for updating a secret
 */
export const validateUpdateSecret: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Secret ID is required')
    .isUUID()
    .withMessage('Secret ID must be a valid UUID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Secret content is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Secret content must be between 1 and 10000 characters')
];

/**
 * Validation rules for deleting a secret
 */
export const validateDeleteSecret: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Secret ID is required')
    .isUUID()
    .withMessage('Secret ID must be a valid UUID')
];

/**
 * Validation rules for getting a single secret
 */
export const validateGetSecret: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Secret ID is required')
    .isUUID()
    .withMessage('Secret ID must be a valid UUID')
];
