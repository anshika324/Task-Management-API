const rateLimit = require('express-rate-limit');

const json429 = (message) => ({ success: false, message });

// Strict: protects login/register from brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json429('Too many attempts, please try again in 15 minutes'),
});

// Generous: a general safety net for the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json429('Too many requests, please slow down'),
});

module.exports = { authLimiter, apiLimiter };