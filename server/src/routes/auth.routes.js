import { Router } from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  logout,
  refresh,
  me
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim().isLength({ max: 100 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post(
  '/signup',
  signupValidation,
  signup
);

router.post(
  '/login',
  loginValidation,
  login
);

router.post(
  '/logout',
  authenticate,
  logout
);

router.post(
  '/refresh',
  body('refreshToken').notEmpty(),
  refresh
);

router.get(
  '/me',
  authenticate,
  me
);

export default router;
