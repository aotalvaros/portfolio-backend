import { Request, Response } from 'express';
import { ModuleStatus } from '../models/moduleStatus.model';
import { getIO } from '../sockets';

export const toggleModuleStatus = async (req: Request, res: Response) => {
  const { moduleName, status } = req.body;

  if (!moduleName || typeof status !== 'boolean') {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  try {
    const updated = await ModuleStatus.findOneAndUpdate(
      { moduleName },
      { isActive: status },
      { new: true, upsert: true }
    );

    // Emitimos a los clientes el nuevo estado
    const io = getIO();
    io.emit('update-module', { moduleName, status });

    return res.status(200).json({ message: 'Estado actualizado', data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error en la base de datos' });
  }
};

export const getModuleStatuses = async (_req: Request, res: Response) => {
  try {
    const modules = await ModuleStatus.find();
    return res.status(200).json(modules);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener los estados' });
  }
};

/*
toggleModuleStatus: cambia el estado (isActive) de un módulo en la base de datos y lo emite por Socket.IO.

getModuleStatuses: obtiene todos los estados guardados en MongoDB para enviarlos al frontend.

*/