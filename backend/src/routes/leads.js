import express            from 'express';
import nodemailer          from 'nodemailer';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const TOOL_LABELS = {
  'credit-card':  'Calculadora de tarjeta de crédito',
  'snowball':     'Simulador de deuda snowball / avalanche',
  'savings':      'Calculadora de meta de ahorro',
  'amortization': 'Tabla de amortización de préstamo',
  'notify-app':   'Notificación: App móvil disponible',
};

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildEmailHtml({ name, email, tool, inputs }) {
  const label = TOOL_LABELS[tool] ?? tool;

  const inputRows = inputs
    ? Object.entries(inputs)
        .map(([k, v]) =>
          `<tr>
            <td style="padding:6px 12px;color:#666;font-size:13px;border-bottom:1px solid #f0f0f0">${k}</td>
            <td style="padding:6px 12px;font-weight:600;font-size:13px;border-bottom:1px solid #f0f0f0">${v}</td>
          </tr>`
        )
        .join('')
    : '';

  const date = new Date().toLocaleString('es-GT', {
    timeZone:  'America/Guatemala',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto">
    <tr>
      <td style="background:#0b1712;padding:24px 28px;border-radius:12px 12px 0 0">
        <p style="margin:0;color:#00b894;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600">MoniFlow — Nuevo Lead</p>
        <h1 style="margin:6px 0 0;color:#f0f5f3;font-size:20px;font-weight:600">${label}</h1>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:24px 28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
          <tr style="background:#f8fdf9">
            <td style="padding:8px 12px;color:#666;font-size:13px;width:120px">Nombre</td>
            <td style="padding:8px 12px;font-weight:600;font-size:13px">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#666;font-size:13px">Email</td>
            <td style="padding:8px 12px;font-weight:600;font-size:13px">
              <a href="mailto:${email}" style="color:#00b894">${email}</a>
            </td>
          </tr>
          <tr style="background:#f8fdf9">
            <td style="padding:8px 12px;color:#666;font-size:13px">Herramienta</td>
            <td style="padding:8px 12px;font-weight:600;font-size:13px">${label}</td>
          </tr>
        </table>

        ${inputRows ? `
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:1px">Datos ingresados</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fdf9;border-radius:8px;overflow:hidden">
          ${inputRows}
        </table>` : ''}

        <p style="margin:20px 0 0;font-size:11px;color:#999;border-top:1px solid #f0f0f0;padding-top:12px">${date}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

router.post(
  '/leads',
  body('name').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('tool').isIn(Object.keys(TOOL_LABELS)).withMessage('Herramienta inválida'),
  body('inputs').optional().isObject(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, tool, inputs } = req.body;

    // Si no hay configuración SMTP, logueamos y respondemos ok (para no romper la UX)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log('[Lead sin SMTP]', { name, email, tool, inputs });
      return res.json({ ok: true });
    }

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from:    `"MoniFlow Leads" <${process.env.SMTP_USER}>`,
        to:      process.env.NOTIFY_EMAIL || 'luis@rocktdigital.com',
        replyTo: email,
        subject: `[MoniFlow Lead] ${TOOL_LABELS[tool] ?? tool} — ${name}`,
        html:    buildEmailHtml({ name, email, tool, inputs }),
      });

      res.json({ ok: true });
    } catch (err) {
      console.error('[Email error]', err.message);
      // Respondemos ok de todas formas para no bloquear al usuario
      res.json({ ok: true });
    }
  }
);

export default router;
