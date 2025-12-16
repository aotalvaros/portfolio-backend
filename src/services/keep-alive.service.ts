import { CronService } from '../presentation/cron/cron-service';
import { MongoDBKeepAliveService } from './mongodb-keepalive.service';
import { logger } from '../utils/logger';

export class KeepAliveService {
  private static instance: KeepAliveService;
  private jobs: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): KeepAliveService {
    if (!KeepAliveService.instance) {
      KeepAliveService.instance = new KeepAliveService();
    }
    return KeepAliveService.instance;
  }

  startMongoDBKeepAlive(): void {
    // Cada 4 horas
    const cronExpression = '0 */2 * * *'; // "0 minutos, cada 4 horas"
    
    const job = CronService.createJob(
      cronExpression,
      async () => {
        logger.info('Starting MongoDB keep-alive check');
        
        // Primero intenta ping directo a la DB
        const dbPing = await MongoDBKeepAliveService.pingDatabase();
        
        // Luego intenta el endpoint completo
        const endpointPing = await MongoDBKeepAliveService.checkModulesEndpoint();
        
        const status = dbPing && endpointPing ? 'SUCCESS' : 'PARTIAL_FAILURE';
        
        logger.info('MongoDB keep-alive completed', {
          status,
          dbPing,
          endpointPing,
          nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        });
      }
    );

    this.jobs.set('mongodb-keepalive', job);
    logger.info('MongoDB keep-alive job started', { 
      schedule: 'Every 4 hours',
      cronExpression 
    });
  }

  startHealthCheck(): void {
    // Health check más frecuente cada 10 minutos
    const cronExpression = '*/10 * * * *'; // "cada 10 minutos"
    
    const job = CronService.createJob(
      cronExpression,
      async () => {
        const dbPing = await MongoDBKeepAliveService.pingDatabase();
        
        if (!dbPing) {
          logger.warn('Health check detected MongoDB connection issue');
        }
      }
    );

    this.jobs.set('health-check', job);
    logger.info('Health check job started', { 
      schedule: 'Every 10 minutes',
      cronExpression 
    });
  }

  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  getJobsStatus(): { name: string; running: boolean }[] {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: job.running
    }));
  }
}

/*
  ¿Que hace este servicio?
  Este servicio gestiona tareas programadas (cron jobs) para mantener viva la conexión con MongoDB.
  Incluye dos trabajos principales:
  1. Un trabajo que se ejecuta cada 2 horas para verificar la conexión a la base de datos y un endpoint relacionado.
  2. Un trabajo de verificación de salud que se ejecuta cada 10 minutos para asegurar que la conexión a MongoDB sigue activa.

  ¿Por qué es importante?
  Mantener viva la conexión con la base de datos es crucial para aplicaciones que dependen de MongoDB,
  ya que las conexiones inactivas pueden ser cerradas por el servidor de la base de datos, lo que puede llevar a fallos en la aplicación.
  Este servicio ayuda a prevenir esos problemas mediante pings regulares y verificaciones de salud.

*/