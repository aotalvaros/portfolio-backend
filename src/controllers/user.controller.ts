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

const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const sanitizeUserResponse = (user: any) => {
  const safeUser = user.toObject ? user.toObject() : user;
  const { password, refreshToken, ...rest } = safeUser;

  return {
    ...rest,
    createdBy: user.createdBy
      ? {
          _id: user.createdBy._id ?? user.createdBy,
          name: user.createdBy.name ?? null,
          email: user.createdBy.email ?? null,
        }
      : null,
  };
};

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const actorId = req.user?.id;
    const actorRole = req.user?.role;

    if (!actorId) {
      res.status(401).json({ status: 'error', message: 'No autenticado' });
      return;
    }

    if (actorRole !== 'superAdmin') {
      res.status(403).json({
        status: 'error',
        message: 'Solo un usuario super admin puede crear usuarios.',
      });
      return;
    }

    const { idUsuario, email, name, password, phone = '', role = 'user', permissions = [] } = req.body ?? {};

    if (!idUsuario || !email || !name || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos: idUsuario, email, name y password.',
      });
      return;
    }

    const normalizedIdUsuario = String(idUsuario).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name).trim();
    const normalizedPassword = String(password);

    if (!normalizedIdUsuario || !normalizedEmail || !normalizedName) {
      res.status(400).json({ status: 'error', message: 'Los campos no pueden quedar vacíos.' });
      return;
    }

    if (!passwordPolicy.test(normalizedPassword)) {
      res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número.',
      });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ idUsuario: normalizedIdUsuario }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.idUsuario === normalizedIdUsuario) {
        res.status(409).json({
          status: 'error',
          message: 'Ya existe un usuario con ese idUsuario.',
        });
        return;
      }

      res.status(409).json({
        status: 'error',
        message: 'Ya existe un usuario con ese correo electrónico.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    const createdUser = await User.create({
      idUsuario: normalizedIdUsuario,
      email: normalizedEmail,
      name: normalizedName,
      password: hashedPassword,
      phone: String(phone ?? '').trim(),
      role: role === 'superAdmin' ? 'superAdmin' : 'user',
      permissions: Array.isArray(permissions) ? permissions : [],
      createdBy: actorId,
      mustChangePassword: true,
      passwordChangedAt: null,
      isBlocked: false,
      blockedBy: null,
      blockedAt: null,
    });

    const populatedUser = await User.findById(createdUser._id).populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente.',
      data: sanitizeUserResponse(populatedUser),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', message: 'Error al crear usuario.' });
  }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const actorRole = req.user?.role;
    const actorId = req.user?.id;
    const targetUserId = req.params.id;
    const desiredState = req.body?.isBlocked ?? true;

    if (!actorId) {
      res.status(401).json({ status: 'error', message: 'No autenticado' });
      return;
    }

    if (actorRole !== 'superAdmin') {
      res.status(403).json({
        status: 'error',
        message: 'Solo un usuario super admin puede bloquear usuarios.',
      });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
      return;
    }

    if (targetUser.role === 'superAdmin' && targetUser._id.toString() !== actorId) {
      res.status(403).json({
        status: 'error',
        message: 'No puedes bloquear a otro usuario super admin.',
      });
      return;
    }

    targetUser.isBlocked = Boolean(desiredState);
    targetUser.blockedBy = (desiredState ? actorId : null) as any;
    targetUser.blockedAt = (desiredState ? new Date() : null) as any;
    await targetUser.save();

    res.json({
      status: 'success',
      message: desiredState ? 'Usuario bloqueado correctamente.' : 'Usuario desbloqueado correctamente.',
      data: {
        _id: targetUser._id,
        email: targetUser.email,
        isBlocked: targetUser.isBlocked,
        blockedBy: targetUser.blockedBy,
        blockedAt: targetUser.blockedAt,
      },
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ status: 'error', message: 'Error al bloquear usuario.' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = (req as AuthenticatedRequest).user!;

    const user = await User.findById(id)
      .select('-password -refreshToken')
      .populate('createdBy', 'name email');

    if (!user) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      return;
    }

    res.json({
      status: 'success',
      data: sanitizeUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener perfil' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = (req as AuthenticatedRequest).user!;
    const { name, avatar, phone } = req.body;

    const updateData: Record<string, string> = {};
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

    if (!newPassword) {
      res.status(400).json({
        status: 'error',
        message: 'Se requiere newPassword.',
      });
      return;
    }

    if (!passwordPolicy.test(String(newPassword))) {
      res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número.',
      });
      return;
    }

    const user = await User.findById(id);
    if (!user || !user.password) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      return;
    }

    const requiresCurrentPassword = user.mustChangePassword === false;

    if (requiresCurrentPassword) {
      if (!currentPassword) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere currentPassword para cambiar la contraseña.',
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        res.status(400).json({ status: 'error', message: 'Contraseña actual incorrecta' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    });

    res.json({
      status: 'success',
      message: user.mustChangePassword
        ? 'Contraseña actualizada correctamente. Ya no se mostrará el aviso de cambio obligatorio.'
        : 'Contraseña actualizada',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar contraseña' });
  }
};