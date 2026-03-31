import { useState } from 'react';
import { CheckCircle2, X, Crown, Users } from 'lucide-react';
import { startCheckout } from '../services/api.js';

const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://app.fintrack.com';

const PLANS = [
  {
    key:      'free',
    name:     'Free',
    icon:     null,
    color:    'text-slate-400',
    border:   'border-white/10',
    bg:       'bg-white/3',
    price:    { monthly: 0, annual: 0 },
    badge:    null,
    cta:      'Comenzar gratis',
    ctaStyle: 'bg-white/8 hover:bg-white/12 text-white/70',
    features: [
      { label: '2 cuentas bancarias',         ok: true  },
      { label: '1 tarjeta de crédito',         ok: true  },
      { label: '50 transacciones / mes',       ok: true  },
      { label: '1 meta de ahorro',             ok: true  },
      { label: 'Presupuesto mensual',          ok: true  },
      { label: 'OCR de recibos con IA',        ok: false },
      { label: 'Préstamos y amortización',     ok: false },
      { label: 'Cash flow y score financiero', ok: false },
      { label: 'Hasta 5 usuarios (familia)',   ok: false },
    ],
  },
  {
    key:      'pro',
    name:     'Pro',
    icon:     Crown,
    color:    'text-indigo-400',
    border:   'border-indigo-500/40',
    bg:       'bg-indigo-500/5',
    ring:     'ring-1 ring-indigo-500/30',
    price:    { monthly: 4.99, annual: 49.90 },
    badge:    'Más popular',
    badgeBg:  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    cta:      'Empezar prueba gratis',
    ctaStyle: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
    trial:    '30 días gratis',
    features: [
      { label: 'Cuentas ilimitadas',           ok: true  },
      { label: 'Tarjetas ilimitadas',          ok: true  },
      { label: 'Transacciones ilimitadas',     ok: true  },
      { label: 'Metas de ahorro ilimitadas',   ok: true  },
      { label: 'Presupuesto mensual',          ok: true  },
      { label: 'OCR de recibos con IA',        ok: true  },
      { label: 'Préstamos y amortización',     ok: true  },
      { label: 'Cash flow y score financiero', ok: true  },
      { label: 'Hasta 5 usuarios (familia)',   ok: false },
    ],
  },
  {
    key:      'familia',
    name:     'Familia',
    icon:     Users,
    color:    'text-emerald-400',
    border:   'border-emerald-500/30',
    bg:       'bg-emerald-500/5',
    price:    { monthly: 7.99, annual: 79.90 },
    badge:    'Mejor valor',
    badgeBg:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    cta:      'Empezar prueba gratis',
    ctaStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/15',
    trial:    '30 días gratis',
    features: [
      { label: 'Todo lo de Pro',               ok: true  },
      { label: 'Hasta 5 usuarios',             ok: true  },
      { label: 'Finanzas compartidas',         ok: true  },
      { label: 'Dashboards familiares',        ok: true  },
      { label: 'Historial compartido',         ok: true  },
      { label: 'Permisos granulares',          ok: true  },
      { label: 'OCR de recibos con IA',        ok: true  },
      { label: 'Préstamos y amortización',     ok: true  },
      { label: 'Cash flow y score financiero', ok: true  },
    ],
  },
];

export default function PricingSection() {
  const [annual,  setAnnual]  = useState(false);
  const [loading, setLoading] = useState(null); // key del plan en proceso
  const [error,   setError]   = useState(null);

  async function handleCta(plan) {
    setError(null);

    // Plan gratis → directo al registro en el app principal
    if (plan.key === 'free') {
      window.location.href = `${APP_URL}/register`;
      return;
    }

    const priceKey = annual ? `${plan.key}_annual` : `${plan.key}_monthly`;
    setLoading(plan.key);

    try {
      const url = await startCheckout(priceKey);
      // Redirigir a la página de checkout de Stripe
      window.location.href = url;
    } catch (err) {
      console.error('[checkout]', err);
      setError('No se pudo iniciar el pago. Por favor, intenta de nuevo.');
      setLoading(null);
    }
  }

  return (
    <div className="w-full">

      {/* ── Toggle mensual / anual ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-white/40'}`}>
          Mensual
        </span>
        <button
          onClick={() => setAnnual(v => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-indigo-600' : 'bg-white/15'}`}
          aria-label="Cambiar facturación anual o mensual"
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${annual ? 'left-7' : 'left-1'}`} />
        </button>
        <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-white/40'}`}>
          Anual
        </span>
        {annual && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            2 meses gratis
          </span>
        )}
      </div>

      {/* ── Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const price   = annual ? plan.price.annual : plan.price.monthly;
          const Icon    = plan.icon;
          const isBusy  = loading === plan.key;

          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border ${plan.border} ${plan.bg} ${plan.ring ?? ''} p-6`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border text-xs font-semibold ${plan.badgeBg}`}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  {Icon && <Icon size={16} className={plan.color} />}
                  <span className={`font-bold text-lg ${plan.color}`}>{plan.name}</span>
                </div>

                {price === 0 ? (
                  <div className="text-3xl font-black text-white">Gratis</div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">${price.toFixed(2)}</span>
                      <span className="text-sm text-white/40">
                        / {annual ? 'año' : 'mes'}
                      </span>
                    </div>
                    {annual && (
                      <p className="text-xs text-white/40 mt-0.5">
                        equivale a ${(plan.price.annual / 12).toFixed(2)}/mes
                      </p>
                    )}
                    {plan.trial && !annual && (
                      <p className="text-xs text-emerald-400 mt-1 font-medium">
                        ✓ {plan.trial}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5">
                    {f.ok ? (
                      <CheckCircle2 size={15} className={`${plan.color} mt-0.5 shrink-0`} />
                    ) : (
                      <X size={15} className="text-white/20 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${f.ok ? 'text-white/80' : 'text-white/25'}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCta(plan)}
                disabled={isBusy || (loading !== null && loading !== plan.key)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${plan.ctaStyle}`}
              >
                {isBusy ? 'Redirigiendo...' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error global */}
      {error && (
        <p className="text-center text-sm text-rose-400 mt-6">{error}</p>
      )}

      <p className="text-center text-sm text-white/25 mt-6">
        Todos los planes de pago incluyen 30 días de prueba gratis · Cancela cuando quieras
      </p>
    </div>
  );
}
