import { ModuleStatus } from '../models/moduleStatus.model';
import { logger } from '../utils/logger';


export class MongoDBKeepAliveService {
  
  static async pingDatabase(): Promise<boolean> {
    try {
      // Operación ligera para mantener la conexión activa
      const count = await ModuleStatus.countDocuments();
      
      logger.info('MongoDB ping successful', { 
        documentsCount: count,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      logger.error('MongoDB ping failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
  }

  static async checkModulesEndpoint(): Promise<boolean> {
    try {
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/modules`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Modules endpoint ping successful', {
        status: response.status,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      logger.error('Modules endpoint ping failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return false;
    }
  }
}

/*
  ¿Que hace este servicio?
  Este servicio proporciona dos métodos estáticos para mantener la conexión con la base de datos MongoDB y 
  verificar la disponibilidad del endpoint de módulos de una API.
  - pingDatabase: Realiza una operación ligera en la base de datos para mantener viva la conexión.
  - checkModulesEndpoint: Envía una solicitud HTTP GET al endpoint de módulos para verificar su disponibilidad.
*/