import rateLimit from 'express-rate-limit';

// ── Rate limiting estricto para /api/checkout ────────────────────────────────
// Evita que bots creen sesiones de Stripe en masa
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Límite de intentos alcanzado. Intenta de nuevo en una hora.' },
});
