import rateLimit from 'express-rate-limit';
import { fail } from '../utils/response.js';

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const limitConfigurado = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 5);
const AUTH_RATE_LIMIT_MAX = Number.isSafeInteger(limitConfigurado) && limitConfigurado > 0
  ? limitConfigurado
  : 5;
const AUTH_RATE_LIMIT_MESSAGE = 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.';

function createAuthRateLimiter({ limit = AUTH_RATE_LIMIT_MAX, windowMs = AUTH_RATE_LIMIT_WINDOW_MS } = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      const resetTime = req.rateLimit?.resetTime;
      const retryAfterSeconds = resetTime
        ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
        : Math.ceil(windowMs / 1000);

      res.setHeader('Retry-After', String(retryAfterSeconds));
      return fail(
        res,
        AUTH_RATE_LIMIT_MESSAGE,
        429,
        'RATE_LIMIT_EXCEEDED',
        { retryAfterSeconds },
      );
    },
  });
}

const loginRateLimiter = createAuthRateLimiter();
const registroRateLimiter = createAuthRateLimiter();

export {
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MESSAGE,
  AUTH_RATE_LIMIT_WINDOW_MS,
  createAuthRateLimiter,
  loginRateLimiter,
  registroRateLimiter,
};

export default { loginRateLimiter, registroRateLimiter };
