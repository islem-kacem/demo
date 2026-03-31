import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Validation rules
const profileUpdateValidation = [
  body('name').optional().trim().isLength({ max: 100 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('website').optional().isURL(),
  body('phone').optional().trim().isLength({ max: 50 })
];

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileUpdateValidation, updateProfile);

// User management (admin only)
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);

export default router;
