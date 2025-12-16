import winston from 'winston';


export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'api' },
    transports: [
        //No crear archivos, por ahora solo consola
        // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'logs/combined.log' }),
        ...(process.env.NODE_ENV !== 'production' 
            ? [new winston.transports.Console()] 
            : [])
    ]
});

/*
    Este archivo configura y exporta un logger utilizando la biblioteca Winston.
    El logger está configurado para registrar mensajes de diferentes niveles de severidad,
    incluyendo errores, si la aplicación no está en modo de producción, también imprime los registros en la consola.
*/