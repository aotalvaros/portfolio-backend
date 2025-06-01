import { Router } from 'express';
import { getModuleStatuses, toggleModuleStatus } from '../controllers/module.controller';
import { authMiddleware } from '../middleware/authMiddleware';

export const moduleRouter = Router();

moduleRouter.get('/', getModuleStatuses);
moduleRouter.post('/toggle', authMiddleware, toggleModuleStatus);


