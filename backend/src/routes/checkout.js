import { Router }          from 'express';
import Stripe               from 'stripe';
import { body, validationResult } from 'express-validator';
import { checkoutLimiter }  from '../index.js';

const router = Router();

// ── Stripe client ────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
  timeout:    10000,
});

// Price IDs configurados en .env (copiados desde Stripe Dashboard)
const PRICES = {
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual:      process.env.STRIPE_PRICE_PRO_ANNUAL,
  familia_monthly: process.env.STRIPE_PRICE_FAMILIA_MONTHLY,
  familia_annual:  process.env.STRIPE_PRICE_FAMILIA_ANNUAL,
};

// ── Validaciones ─────────────────────────────────────────────────────────────
const checkoutValidation = [
  body('price_key')
    .isIn(Object.keys(PRICES))
    .withMessage('Plan no válido'),
];

// ── POST /api/checkout ───────────────────────────────────────────────────────
// Crea una sesión de Stripe Checkout para el landing site.
// No requiere autenticación: el usuario crea su cuenta en el app principal
// después del pago (el stripe_session se pasa como query param).
router.post(
  '/checkout',
  checkoutLimiter,
  checkoutValidation,
  async (req, res) => {
    // Validar input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { price_key } = req.body;
    const priceId = PRICES[price_key];

    if (!priceId) {
      return res.status(400).json({ error: 'Precio no configurado en el servidor' });
    }

    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      console.error('APP_URL no configurada');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode:                 'subscription',
        payment_method_types: ['card'],
        line_items:           [{ price: priceId, quantity: 1 }],

        // 30 días de prueba gratis al igual que el app principal
        subscription_data: {
          trial_period_days: 30,
        },

        // Permite usar códigos promocionales desde el landing
        allow_promotion_codes: true,

        // Después del pago → main app con el session_id para vincular la cuenta
        success_url: `${appUrl}/register?stripe_session={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${appUrl.replace('app.', '')  || appUrl}/#precios`,

        // La sesión expira en 30 min (Stripe default), sin datos sensibles aquí
      });

      // Solo devolver la URL, nunca el session ID completo al cliente
      return res.json({ url: session.url });

    } catch (err) {
      console.error('[checkout] Error de Stripe:', err.message);
      // No exponer mensajes internos de Stripe al cliente
      return res.status(500).json({ error: 'No se pudo iniciar el proceso de pago' });
    }
  }
);

export default router;
