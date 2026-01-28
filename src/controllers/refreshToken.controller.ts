import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../models/module.user';
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token requerido' });
    return;
  }

  // Busca el usuario por el refreshToken
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.status(401).json({ error: 'Refresh token inválido' });
    return;
  }

  const token = jwt.sign({
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    avatar: user.avatar,
    permissions: user.permissions,
  }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  res.json({ token });
};