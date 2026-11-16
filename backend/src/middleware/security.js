import rateLimit from 'express-rate-limit';

/**
 * Sanitizes an object recursively by stripping any keys starting with '$' or containing '.'
 * to prevent NoSQL Operator Injection.
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys starting with '$' or containing '.'
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = typeof value === 'object' && value !== null ? sanitizeObject(value) : value;
  }
  return sanitized;
};

/**
 * Express middleware to prevent NoSQL operator injection in req.body, req.query, and req.params
 */
export const sanitizeData = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

/**
 * Prevent browser back-button history caching of sensitive authenticated endpoints
 */
export const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
};

/**
 * Rate Limiter for Authentication endpoints (login, register)
 * Prevents brute-force credential stuffing and DoS attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Rate Limiter for Code Execution endpoints (run, submit)
 * Prevents server CPU/RAM exhaustion
 */
export const codeExecutionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 executions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Code execution rate limit exceeded. Please wait a moment before running or submitting again.'
  }
});

/**
 * General API Rate Limiter
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  }
});
