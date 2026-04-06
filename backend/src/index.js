import 'dotenv/config';
import express    from 'express';
import helmet     from 'helmet';
import cors       from 'cors';
import rateLimit  from 'express-rate-limit';
import checkoutRouter from './routes/checkout.js';

const app  = express();
const PORT = process.env.PORT || 4001;

app.set('trust proxy', 1);

// ── Seguridad: cabeceras HTTP ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    },
  },
  hsts: {
    maxAge:            63072000, // 2 años
    includeSubDomains: true,
    preload:           true,
  },
}));

// ── CORS: solo permite el dominio del landing ────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permite ausencia de origin en llamadas server-to-server o tests locales
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  methods:          ['POST', 'OPTIONS'],
  allowedHeaders:   ['Content-Type'],
  optionsSuccessStatus: 204,
}));

// ── Rate limiting global ─────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' },
});
app.use(globalLimiter);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body

// ── Deshabilitar cabecera X-Powered-By ───────────────────────────────────────
app.disable('x-powered-by');

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api', checkoutRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // No exponer detalles internos en producción
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Error interno del servidor',
  });
});

// ── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Landing backend corriendo en puerto ${PORT}`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('ADVERTENCIA: STRIPE_SECRET_KEY no configurada');
  }
});
