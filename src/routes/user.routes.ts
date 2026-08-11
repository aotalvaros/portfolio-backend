import { Router } from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const userRoutes = Router();

userRoutes.get('/profile', authMiddleware, getProfile);
userRoutes.patch('/profile', authMiddleware, updateProfile);
userRoutes.patch('/password', authMiddleware, updatePassword);

export default userRoutes