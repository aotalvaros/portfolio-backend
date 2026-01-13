import { Request, Response } from 'express';
import { ModuleStatus } from '../models/moduleStatus.model';
import { getIO } from '../sockets';
import { cache } from '../utils/cache';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const CACHE_KEY = 'module-statuses';
const CACHE_TTL = 30000; // 30 segundos

export const toggleModuleStatus = async (req: AuthenticatedRequest, res: Response) => {
  const io = getIO();
  try {
    const { moduleName } = req.body;
    const userId = req.user?.id; // Usuario autenticado del middleware

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    const module = await ModuleStatus.findOneAndUpdate(
      { moduleName },
      [{ $set: { 
        isActive: { $not: '$isActive' },
        isBlocked: { $not: '$isBlocked' },
        lastModifiedAt: new Date(),
        lastModifiedBy: userId
      }}],
      { new: true, lean: true }
    ).populate('lastModifiedBy', 'name email');

    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    // Limpiar caché cuando hay cambios
    cache.delete(CACHE_KEY);
    console.log('Cache cleared due to module status change');

    // Emitir cambio por Socket.IO
    io.emit('moduleStatusChanged', {
      moduleName,
      isActive: module.isActive,
      isBlocked: module.isBlocked,
      lastModifiedAt: module.lastModifiedAt,
      lastModifiedBy: module.lastModifiedBy
    });

    res.status(200).json({
      status: 'success',
      data: module
    });

  } catch (error) {
    console.error('Error toggling module status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error toggling module status'
    });
  }
};

export const getModuleStatuses = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // 1. Intentar obtener del caché primero
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData) {
      console.log(`Cache hit for modules - Response time: ${Date.now() - startTime}ms`);
      return res.status(200).json({
        status: 'success',
        data: cachedData,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    // 2. Si no está en caché, consultar BD con optimizaciones
    console.log('Cache miss - Querying database...');
    
    const modules = await ModuleStatus.find({})
      .select('moduleName isActive name isBlocked lastModifiedAt lastModifiedBy')
      .populate('lastModifiedBy', 'name email')
      .lean()
      .maxTimeMS(5000)
      .exec();

    // 3. Guardar en caché
    cache.set(CACHE_KEY, modules, CACHE_TTL);

    const responseTime = Date.now() - startTime;
    console.log(`Database query completed - Response time: ${responseTime}ms`);

    res.status(200).json({
      status: 'success',
      data: modules,
      cached: false,
      responseTime
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Error getting module statuses (${responseTime}ms):`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving module statuses',
      responseTime
    });
  }
};

/*
toggleModuleStatus: cambia el estado (isActive) de un módulo en la base de datos y lo emite por Socket.IO.

getModuleStatuses: obtiene todos los estados guardados en MongoDB para enviarlos al frontend.

*/