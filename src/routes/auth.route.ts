import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { refreshToken } from '../controllers/refreshToken.controller';

export const authRouter = Router();
authRouter.post('/login', login);
authRouter.post('/refresh-token', refreshToken);
