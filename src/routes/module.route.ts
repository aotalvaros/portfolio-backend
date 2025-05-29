import { Router } from 'express';
import { getModuleStatuses, toggleModuleStatus } from '../controllers/module.controller';

export const moduleRouter = Router();

// Ruta para obtener el estado de todos los módulos
moduleRouter.get('/', getModuleStatuses);

// Ruta para cambiar el estado de un módulo (activo/inactivo)
moduleRouter.post('/toggle', toggleModuleStatus);

