import rateLimit from 'express-rate-limit';

export const contactRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: {
    error: 'Demasiadas solicitudes. Inténtalo de nuevo en un momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
