import { CronJob } from 'cron';

type CronTime = string | Date;
type OnTick = () => void;


export class CronService  {

  static createJob( cronTime: CronTime, onTick: OnTick ): CronJob {

    const job = new CronJob( cronTime,onTick );
    
    job.start();
    
    return job;

  }

}

/*
  ¿Que es un CronJob?
  Un CronJob es una tarea programada que se ejecuta automáticamente en intervalos regulares o en momentos específicos del tiempo, 
  utilizando la sintaxis de cron para definir el horario de ejecución.
*/