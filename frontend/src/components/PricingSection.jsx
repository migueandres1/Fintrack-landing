import { useState } from 'react';
import { CheckCircle2, X, Crown, Users } from 'lucide-react';
import { startCheckout } from '../services/api.js';

const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://app.moniflow.com';

const PLANS = [
  {
    key:     'free',
    name:    'Gratis',
    tagline: 'Para empezar a tomar control',
    icon:    null,
    price:   { monthly: 0, annual: 0 },
    badge:   null,
    cta:     'Comenzar gratis',
    ctaCls:  'bg-[#1e3d2a] hover:bg-[#2e5c3e] text-[#f0f5f3] border border-[#2e5c3e]',
    card:    'border-[#1e3d2a] bg-[#152a1e]',
    ring:    '',
    color:   'text-[#5a9070]',
    features: [
      { label: '2 cuentas bancarias',          ok: true  },
      { label: '1 tarjeta de crédito',          ok: true  },
      { label: '50 transacciones / mes',        ok: true  },
      { label: '1 meta de ahorro',              ok: true  },
      { label: 'Presupuesto mensual básico',    ok: true  },
      { label: 'OCR de recibos con IA',         ok: false },
      { label: 'Préstamos y amortización',      ok: false },
      { label: 'Flujo de caja y score',         ok: false },
      { label: 'Hasta 5 usuarios (familia)',    ok: false },
    ],
  },
  {
    key:     'pro',
    name:    'Pro',
    tagline: 'Para quien quiere el control completo',
    icon:    Crown,
    price:   { monthly: 2.99, annual: 29.90 },
    badge:   'Más popular',
    badgeCls:'bg-[#00b894]/15 text-[#00b894] border border-[#00b894]/30',
    cta:     'Empezar 30 días gratis',
    ctaCls:  'bg-[#00b894] hover:bg-[#55d8b4] text-[#001e18] shadow-caribe font-bold',
    card:    'border-[#00b894]/40 bg-[#152a1e]',
    ring:    'ring-1 ring-[#00b894]/25',
    color:   'text-[#00b894]',
    trial:   '30 días gratis',
    features: [
      { label: 'Cuentas ilimitadas',            ok: true  },
      { label: 'Tarjetas ilimitadas',           ok: true  },
      { label: 'Transacciones ilimitadas',      ok: true  },
      { label: 'Metas de ahorro ilimitadas',    ok: true  },
      { label: 'Presupuesto mensual completo',  ok: true  },
      { label: 'OCR de recibos con IA',         ok: true  },
      { label: 'Préstamos y amortización',      ok: true  },
      { label: 'Flujo de caja y score',         ok: true  },
      { label: 'Hasta 5 usuarios (familia)',    ok: false },
    ],
  },
  {
    key:     'familia',
    name:    'Familia',
    tagline: 'Para organizar las finanzas en familia',
    icon:    Users,
    price:   { monthly: 3.99, annual: 39.90 },
    badge:   'Mejor valor',
    badgeCls:'bg-[#55d8b4]/10 text-[#55d8b4] border border-[#55d8b4]/25',
    cta:     'Empezar 30 días gratis',
    ctaCls:  'bg-[#1e3d2a] hover:bg-[#2e5c3e] text-[#00b894] border border-[#00b894]/40 font-bold',
    card:    'border-[#2e5c3e] bg-[#152a1e]',
    ring:    '',
    color:   'text-[#55d8b4]',
    trial:   '30 días gratis',
    features: [
      { label: 'Todo lo de Pro',                ok: true  },
      { label: 'Hasta 5 usuarios',              ok: true  },
      { label: 'Cuentas y metas compartidas',   ok: true  },
      { label: 'Dashboard familiar',            ok: true  },
      { label: 'Historial compartido',          ok: true  },
      { label: 'Permisos por usuario',          ok: true  },
      { label: 'OCR de recibos con IA',         ok: true  },
      { label: 'Préstamos y amortización',      ok: true  },
      { label: 'Flujo de caja y score',         ok: true  },
    ],
  },
];

export default function PricingSection() {
  const [annual,  setAnnual]  = useState(false);
  const [loading, setLoading] = useState(null);
  const [error,   setError]   = useState(null);

  async function handleCta(plan) {
    setError(null);
    if (plan.key === 'free') {
      window.location.href = `${APP_URL}/register`;
      return;
    }

    const priceKey = annual ? `${plan.key}_annual` : `${plan.key}_monthly`;
    setLoading(plan.key);

    try {
      const url = await startCheckout(priceKey);
      window.location.href = url;
    } catch (err) {
      console.error('[checkout]', err);
      setError('No se pudo iniciar el pago. Por favor, intentá de nuevo.');
      setLoading(null);
    }
  }

  return (
    <div className="w-full">

      {/* ── Toggle mensual / anual ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`font-sans text-sm font-medium transition-colors ${!annual ? 'text-[#f0f5f3]' : 'text-[#5a9070]'}`}>
          Mensual
        </span>
        <button
          onClick={() => setAnnual(v => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#00b894]' : 'bg-[#2e5c3e]'}`}
          aria-label="Cambiar facturación anual o mensual"
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${annual ? 'left-7' : 'left-1'}`} />
        </button>
        <span className={`font-sans text-sm font-medium transition-colors ${annual ? 'text-[#f0f5f3]' : 'text-[#5a9070]'}`}>
          Anual
        </span>
        {annual && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#00b894]/15 border border-[#00b894]/30 text-[#00b894] text-xs font-semibold">
            2 meses gratis
          </span>
        )}
      </div>

      {/* ── Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const price  = annual ? plan.price.annual : plan.price.monthly;
          const Icon   = plan.icon;
          const isBusy = loading === plan.key;

          return (
            <div key={plan.key}
              className={`relative flex flex-col rounded-2xl border p-6 ${plan.card} ${plan.ring}`}>

              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${plan.badgeCls}`}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  {Icon && <Icon size={15} className={plan.color} />}
                  <span className={`font-sans font-bold text-base ${plan.color}`}>{plan.name}</span>
                </div>
                {plan.tagline && (
                  <p className="font-sans text-[#5a9070] text-xs mb-3">{plan.tagline}</p>
                )}

                {price === 0 ? (
                  <div>
                    <span className="font-sans text-3xl font-black text-[#f0f5f3]">Gratis</span>
                    <p className="font-sans text-xs text-[#5a9070] mt-1">Para siempre</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-medium text-[#f0f5f3]">
                        ${price.toFixed(2)}
                      </span>
                      <span className="font-sans text-sm text-[#5a9070]">
                        / {annual ? 'año' : 'mes'}
                      </span>
                    </div>
                    {annual && (
                      <p className="font-sans text-xs text-[#5a9070] mt-0.5">
                        equivale a ${(plan.price.annual / 12).toFixed(2)}/mes
                      </p>
                    )}
                    {plan.trial && !annual && (
                      <p className="font-sans text-xs text-[#00b894] mt-1.5 font-medium">
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
                    {f.ok
                      ? <CheckCircle2 size={14} className={`${plan.color} mt-0.5 shrink-0`} />
                      : <X            size={14} className="text-[#1e3d2a] mt-0.5 shrink-0" />
                    }
                    <span className={`font-sans text-sm ${f.ok ? 'text-[#f0f5f3]/80' : 'text-[#2e5c3e]'}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCta(plan)}
                disabled={isBusy || (loading !== null && loading !== plan.key)}
                className={`w-full py-3 rounded-xl font-sans text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${plan.ctaCls}`}
              >
                {isBusy ? 'Redirigiendo...' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-center font-sans text-sm text-[#e53e3e] mt-6">{error}</p>
      )}

      <p className="text-center font-sans text-sm text-[#5a9070] mt-6">
        Sin tarjeta de crédito · Sin fecha de vencimiento · Cancela cuando quieras
      </p>
    </div>
  );
}
