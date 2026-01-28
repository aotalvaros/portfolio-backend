import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/*Este middleware asegura que solo los usuarios con un token JWT válido puedan acceder a ciertas rutas, 
  y proporciona la información del usuario autenticado al resto de la aplicación. */

export const authMiddleware = ( req: AuthenticatedRequest, res: Response, next: NextFunction ): void  => {
  const authHeader = req.headers.authorization;
  if (!authHeader){
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '') as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({ error: 'Token inválido' });
      return 
    }
    throw err; // Otros errores (por ejemplo, problemas de configuración) no se silencian y pueden ser manejados por un middleware global de errores.
  }
};
