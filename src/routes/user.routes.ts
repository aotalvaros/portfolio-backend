import { Router } from 'express';
import { createUser, getProfile, updateProfile, updatePassword, blockUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const userRoutes = Router();

userRoutes.post('/create', authMiddleware, createUser);
userRoutes.patch('/:id/block', authMiddleware, blockUser);
userRoutes.get('/profile', authMiddleware, getProfile);
userRoutes.patch('/profile', authMiddleware, updateProfile);
userRoutes.patch('/password', authMiddleware, updatePassword);

export default userRoutes