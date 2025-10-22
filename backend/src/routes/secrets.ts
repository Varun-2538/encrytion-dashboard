import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  validateCreateSecret,
  validateUpdateSecret,
  validateDeleteSecret,
  validateGetSecret,
  handleValidationErrors
} from '../middleware/validation';
import {
  getAllSecrets,
  getSecretById,
  createSecret,
  updateSecret,
  deleteSecret
} from '../controllers/secretsController';

const router = express.Router();

// Get all secrets for authenticated user
router.get('/', authenticate, getAllSecrets);

// Get a single secret by ID
router.get(
  '/:id',
  authenticate,
  validateGetSecret,
  handleValidationErrors,
  getSecretById
);

// Create a new secret
router.post(
  '/',
  authenticate,
  validateCreateSecret,
  handleValidationErrors,
  createSecret
);

// Update an existing secret
router.put(
  '/:id',
  authenticate,
  validateUpdateSecret,
  handleValidationErrors,
  updateSecret
);

// Delete a secret
router.delete(
  '/:id',
  authenticate,
  validateDeleteSecret,
  handleValidationErrors,
  deleteSecret
);

export default router;
