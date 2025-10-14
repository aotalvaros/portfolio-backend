import { Request, Response, NextFunction } from 'express';

export const timingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;
    
    // Log normal para requests rápidos
    if (duration < 1000) {
      console.log(`⚡ ${logMessage}`);
    } 
    // Warning para requests lentos
    else if (duration < 3000) {
      console.warn(`🐌 SLOW: ${logMessage}`);
    }
    // Error para requests muy lentos
    else {
      console.error(`🚨 VERY SLOW: ${logMessage}`);
    }
  });
  
  next();
};