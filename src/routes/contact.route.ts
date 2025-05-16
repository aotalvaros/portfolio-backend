import { Router } from 'express';
import { handleContact } from '../controllers/contact.controller';
import { contactRateLimiter } from '../middleware/rateLimit';

export const contactRouter = Router();

contactRouter.post('/', contactRateLimiter, handleContact);