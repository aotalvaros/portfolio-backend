import { Request, Response } from 'express';
import { User } from '../models/module.user';
import bcrypt from 'bcrypt';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = (req as AuthenticatedRequest).user!;
    
    const user = await User.findById(id).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      return;
    }

    res.json({ 
      status: 'success', 
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener perfil' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = (req as AuthenticatedRequest).user!;
    const { name, avatar, phone } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (phone) updateData.phone = phone;

    await User.findByIdAndUpdate(id, updateData);

    res.json({ status: 'success', message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar perfil' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = (req as AuthenticatedRequest).user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Se requieren currentPassword y newPassword' 
      });
      return;
    }

    const user = await User.findById(id);
    if (!user || !user.password) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(400).json({ status: 'error', message: 'Contraseña actual incorrecta' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.json({ status: 'success', message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar contraseña' });
  }
};