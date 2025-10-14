import { Request, Response } from 'express';
import { ModuleStatus } from '../models/moduleStatus.model';
import { getIO } from '../sockets';
import { cache } from '../utils/cache';

const CACHE_KEY = 'module-statuses';
const CACHE_TTL = 30000; // 30 segundos

export const toggleModuleStatus = async (req: Request, res: Response) => {
  const io = getIO();
  try {
    const { moduleName } = req.body;

    const module = await ModuleStatus.findOneAndUpdate(
      { moduleName },
      [{ $set: { isActive: { $not: '$isActive' } } }],
      { new: true, lean: true }
    );

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
      isActive: module.isActive
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
      .select('moduleName isActive name') // Solo campos necesarios
      .lean() // Retorna objetos JS planos (más rápido)
      .maxTimeMS(5000) // Timeout de 5 segundos
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