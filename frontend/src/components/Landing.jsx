import { useState } from 'react';
import {
  ArrowRight, CheckCircle2, Check, X, Minus, Menu,
  BarChart2, Wallet, CreditCard, Target,
  TrendingUp, Receipt, Send, ChevronRight,
  Calculator, TrendingDown, PiggyBank, Percent,
  LayoutGrid, Smartphone, Bell,
} from 'lucide-react';
import PricingSection from './PricingSection.jsx';
import CalcModal      from './CalcModal.jsx';
import NotifyModal    from './NotifyModal.jsx';

const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://app.moniflow.com';


// ── Data ─────────────────────────────────────────────────────────────────────
const PAINS = [
  {
    icon:  TrendingDown,
    title: '¿A dónde se fue mi sueldo?',
    desc:  'El sueldo llega el lunes y el miércoles ya no sé exactamente qué pasó. Sé que gasté, pero no recuerdo en qué.',
  },
  {
    icon:  CreditCard,
    title: '¿Pago solo el mínimo de la tarjeta?',
    desc:  'Porque no sé exactamente cuánto debo en total ni cuánto me cuesta en intereses cada mes que dejo pasar.',
  },
  {
    icon:  LayoutGrid,
    title: '¿Trato de llevar mis cuentas ordenadas e igual no funciona?',
    desc:  'Empecé ordenado, pero se fue complicando. Al final lo abandoné y volví a adivinar.',
  },
];

const FEATURES = [
  {
    icon:  BarChart2,
    title: 'Comprende exactamente a dónde se va tu dinero.',
    desc:  'Registrá en efectivo o tarjeta en segundos. Categorías automáticas con IA. Ve cuánto llevás gastado vs. lo planeado.',
  },
  {
    icon:  CreditCard,
    title: 'Deja de adivinar cuánto debes en tu tarjeta',
    desc:  'Fecha de corte, saldo real, intereses estimados. Ve qué pasa si solo pagás el mínimo vs. el total.',
  },
  {
    icon:  Wallet,
    title: 'Por primera vez, entiende tu tabla de amortización',
    desc:  'Desglose completo cuota por cuota. Cuánto va a capital y cuánto a intereses. Estrategias snowball y avalanche.',
  },
  {
    icon:  TrendingUp,
    title: 'Conoce si llegarás a fin de mes antes de que llegue.',
    desc:  'Proyección día a día de tu saldo futuro. Ve los problemas con anticipación, no después.',
  },
  {
    icon:  Target,
    title: 'Tu próxima meta, con un plan que sí funciona',
    desc:  'Definí cuánto necesitás y para cuándo. La IA calcula cuánto aportar cada mes según tus ingresos reales.',
  },
  {
    icon:  Receipt,
    title: 'Tomale fotos a tus recibos. Listo.',
    desc:  'La IA lee el ticket y registra el gasto por vos. Sin tipear. Sin excusas.',
  },
];

const STEPS = [
  {
    n:     '01',
    title: 'Crea tu perfil financiero',
    desc:  'Solo tu correo. Sin datos bancarios. Sin tarjeta. Listo en 30 segundos.',
  },
  {
    n:     '02',
    title: 'Agrega tus movimientos',
    desc:  'Cuentas, tarjetas y deudas en un solo lugar. El onboarding te guía en menos de 3 minutos.',
  },
  {
    n:     '03',
    title: 'Ve tu dinero en tiempo real',
    desc:  'Fotografiá un recibo, armá tu presupuesto del mes, definí tu primera meta de ahorro.',
  },
];

const TESTIMONIALS = [
  {
    quote:    'Por primera vez en 10 años de trabajo sé exactamente cuánto debo, en qué gasto y cuándo termino de pagar mi carro.',
    name:     'Sofía R.',
    location: 'Ciudad de Guatemala',
    initials: 'SR',
  },
  {
    quote:    'Recibo remesas de mi hermano en Houston y nunca había podido planificar bien. Ahora tengo todo consolidado: gastos, deudas y lo que ahorro cada mes.',
    name:     'Carlos M.',
    location: 'San Pedro Sula, Honduras',
    initials: 'CM',
  },
  {
    quote:    'Soy freelancer y cobro en dólares. MoniFlow es lo único que me funciona para manejar mis cuentas en colones y dólares al mismo tiempo.',
    name:     'Valeria C.',
    location: 'San José, Costa Rica',
    initials: 'VC',
  },
];

const COMPARISON = [
  { feature: 'Español completo',                mf: 'yes', wallet: 'yes',  pocket: 'no'  },
  { feature: 'Módulo de deudas completo',       mf: 'yes', wallet: 'no',   pocket: 'part' },
  { feature: 'Remesas como categoría nativa',   mf: 'yes', wallet: 'no',   pocket: 'no'  },
  { feature: 'Bancos centroamericanos',         mf: 'yes', wallet: 'part', pocket: 'no'  },
  { feature: 'Score financiero personal',       mf: 'yes', wallet: 'no',   pocket: 'no'  },
  { feature: 'Tabla de amortización',           mf: 'yes', wallet: 'no',   pocket: 'yes' },
  { feature: 'Flujo de caja proyectado',        mf: 'yes', wallet: 'no',   pocket: 'yes' },
  { feature: 'Plan gratuito disponible',        mf: 'yes', wallet: 'yes',  pocket: 'no'  },
  { feature: 'Precio accesible para la región', mf: 'yes', wallet: 'part', pocket: 'no'  },
];

function CompCell({ val }) {
  if (val === 'yes')  return <Check size={16} className="mx-auto text-[#00b894]" />;
  if (val === 'no')   return <X     size={16} className="mx-auto text-[#2e5c3e]" />;
  if (val === 'part') return <Minus size={16} className="mx-auto text-[#f0a500]" />;
  return null;
}

const CALCULADORAS = [
  {
    icon:     Calculator,
    calcType: 'credit-card',
    title:    'Calculadora de tarjeta de crédito',
    desc:     'Ve cuánto te cuesta pagar solo el mínimo y cuándo terminarías de pagar.',
  },
  {
    icon:     TrendingDown,
    calcType: 'snowball',
    title:    'Simulador de deuda snowball / avalanche',
    desc:     'Compará estrategias para salir de deudas más rápido y pagar menos intereses.',
  },
  {
    icon:     PiggyBank,
    calcType: 'savings',
    title:    'Calculadora de meta de ahorro',
    desc:     'Cuánto necesitás ahorrar por mes para llegar a tu meta en el tiempo que querés.',
  },
  {
    icon:     Percent,
    calcType: 'amortization',
    title:    'Tabla de amortización de préstamo',
    desc:     'Desglose cuota por cuota: capital, intereses y saldo pendiente.',
  },
];

const FAQS = [
  {
    q: '¿Para qué países funciona MoniFlow?',
    a: 'MoniFlow funciona en toda Centroamérica: Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá. También está diseñada para países dolarizados del Caribe y América Latina como República Dominicana y Ecuador. Si manejás dólares o tu moneda local, MoniFlow funciona para vos.',
  },
  {
    q: '¿MoniFlow se conecta a mi banco o guarda mis contraseñas?',
    a: 'No. MoniFlow no se conecta a tu banca en línea ni almacena credenciales bancarias. Registrás tus transacciones manualmente o fotografiando tus recibos. Máxima privacidad y control total sobre tus datos.',
  },
  {
    q: '¿Cuánto cuesta MoniFlow?',
    a: 'MoniFlow tiene un plan gratuito con funciones básicas. El plan Pro incluye 30 días de prueba gratuita (requiere tarjeta de crédito). Si cancelás antes de que termine el período de prueba, no te cobramos nada.',
  },
  {
    q: '¿Puedo usar MoniFlow si recibo remesas?',
    a: 'Sí, y es una de las funciones estrella de la app. MoniFlow trata las remesas como categoría nativa de ingreso: con origen, frecuencia y planificación integrada. Ideal para familias en Honduras, El Salvador, Guatemala, Rep. Dominicana y más.',
  },
  {
    q: '¿MoniFlow tiene app para celular?',
    a: 'La versión web ya está disponible y funciona perfectamente en tu celular. Las apps nativas para iOS y Android están en desarrollo y lanzarán muy pronto. Registrate hoy y te avisamos el día del lanzamiento.',
  },
  {
    q: '¿Es seguro usar MoniFlow?',
    a: 'Sí. MoniFlow no almacena contraseñas ni datos de acceso bancario. Solo registrás tus transacciones y metas financieras. Tus datos están protegidos y nunca los compartimos con terceros.',
  },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [activeCalc,  setActiveCalc]  = useState(null);   // 'credit-card' | 'snowball' | 'savings' | 'amortization'
  const [showNotify,  setShowNotify]  = useState(false);

  return (
    <div className="font-sans overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0b1712]/90 backdrop-blur-md border-b border-[#1e3d2a]/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img src="/logos/moniflow-02-logo-dark.svg" style={{ height: '28px', width: 'auto' }} alt="MoniFlow" />
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {[['Funciones', '#funciones'], ['Calculadoras', '#calculadoras'], ['Precios', '#precios']].map(([label, href]) => (
              <a key={label} href={href}
                className="text-sm text-[#5a9070] hover:text-[#f0f5f3] transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={`${APP_URL}/login`}
              className="hidden md:block px-4 py-2 text-sm text-[#5a9070] hover:text-[#f0f5f3] transition-colors rounded-lg">
              Iniciar sesión
            </a>
            <a href={`${APP_URL}/register`}
              className="px-4 py-2 text-sm font-semibold bg-[#00b894] hover:bg-[#55d8b4] text-[#001e18] rounded-lg transition-colors shadow-caribe">
              Empieza gratis
            </a>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 -mr-1 text-[#5a9070] hover:text-[#f0f5f3] transition-colors"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1e3d2a]/60 bg-[#0b1712] px-6 py-5">
            <nav className="flex flex-col">
              {[['Funciones', '#funciones'], ['Calculadoras', '#calculadoras'], ['Precios', '#precios']].map(([label, href]) => (
                <a key={label} href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[#5a9070] hover:text-[#f0f5f3] transition-colors py-3 border-b border-[#1e3d2a]/50 last:border-0">
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-[#1e3d2a]/50">
              <a href={`${APP_URL}/login`}
                className="block text-sm text-center text-[#5a9070] hover:text-[#f0f5f3] transition-colors py-2 mb-2">
                Iniciar sesión
              </a>
              <a href={`${APP_URL}/register`}
                className="block px-4 py-2.5 text-sm font-semibold bg-[#00b894] hover:bg-[#55d8b4] text-[#001e18] rounded-lg transition-colors text-center">
                Empieza 30 días gratis
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0b1712] min-h-[calc(100vh-64px)] flex flex-col justify-center relative overflow-hidden">
        {/* Topographic SVG texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="topo" x="0" y="0" width="400" height="300" patternUnits="userSpaceOnUse">
                <path d="M-40 240 Q40 180 120 220 Q200 260 280 200 Q360 140 440 180" fill="none" stroke="#00b894" strokeWidth="1"/>
                <path d="M-40 210 Q40 150 120 190 Q200 230 280 170 Q360 110 440 150" fill="none" stroke="#00b894" strokeWidth="1"/>
                <path d="M-40 180 Q60 120 140 160 Q220 200 300 140 Q380 80 460 120" fill="none" stroke="#00b894" strokeWidth="1"/>
                <path d="M-40 150 Q80 90 160 130 Q240 170 320 110 Q400 50 480 90" fill="none" stroke="#00b894" strokeWidth="1"/>
                <path d="M-40 120 Q100 60 180 100 Q260 140 340 80 Q420 20 500 60" fill="none" stroke="#00b894" strokeWidth="1"/>
                <path d="M0 290 Q80 230 160 270 Q240 310 320 250 Q400 190 480 230" fill="none" stroke="#00b894" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">

            {/* Left: content */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#152a1e] border border-[#2e5c3e] text-[#00b894] text-xs font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b894] animate-pulse" />
                Diseñado para Centroamérica, el Caribe y países dolarizados
              </span>

              <h1 className="font-display font-light text-[#f0f5f3] leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(42px, 5.5vw, 68px)', letterSpacing: '-0.02em' }}>
                Tu dinero,<br />
                <span className="font-semibold">bajo control.</span><br />
                <span className="font-light italic" style={{ color: '#00b894' }}>En tu idioma.</span>
              </h1>

              <p className="font-sans text-[#5a9070] text-lg leading-relaxed mb-3 max-w-lg">
                La app de finanzas personales para Centroamérica y el Caribe.
              </p>
              <p className="font-sans text-[#2e5c3e] text-base leading-relaxed mb-10 max-w-lg">
                Gastos, tarjetas, deudas y metas — en un solo lugar, en tu idioma.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <a href={`${APP_URL}/register`}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#00b894] hover:bg-[#55d8b4] text-[#001e18] font-semibold rounded-lg transition-all shadow-caribe hover:-translate-y-0.5 text-sm">
                  Empieza gratis
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#2e5c3e] text-[#5a9070] hover:text-[#f0f5f3] hover:border-[#5a9070] rounded-lg transition-all text-sm">
                  Ver cómo funciona
                </a>
              </div>

              <p className="text-xs text-[#5a9070]">
                ✓ Web, iOS y Android &nbsp;·&nbsp; ✓ En español &nbsp;·&nbsp; ✓ 30 días gratis en Pro
              </p>
            </div>

            {/* Right: App mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xs">
                <div className="absolute -inset-4 bg-[#00b894]/8 rounded-3xl blur-2xl pointer-events-none" />
                <div className="relative bg-[#152a1e] border border-[#1e3d2a] rounded-2xl p-5 shadow-2xl"
                  style={{ transform: 'perspective(1200px) rotateY(-5deg) rotateX(2deg)' }}>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[#5a9070] text-[11px] font-medium">Buenos días, Sofía</p>
                      <p className="font-mono text-[#f0f5f3] text-xl font-medium mt-0.5">$ 2,840.00</p>
                      <p className="text-[#00b894] text-[11px] mt-0.5">↑ +$ 120 vs. mes pasado</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#0b1712] flex items-center justify-center border border-[#1e3d2a]">
                      <img src="/logos/moniflow-05-isotipo-dark.svg" style={{ width: '18px', height: '18px' }} alt="MoniFlow" />
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="flex gap-1 items-end h-12 mb-4">
                    {[38, 62, 45, 75, 52, 88, 68].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm"
                        style={{ height: `${h}%`, background: i === 6 ? '#00b894' : 'rgba(0,184,148,0.22)' }} />
                    ))}
                  </div>

                  {/* Account pills */}
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    {[['BAC', '$ 2,840', false], ['Efectivo', '$ 450', false], ['Visa', '-$ 1,250', true]].map(([label, val, neg]) => (
                      <div key={label} className="bg-[#0b1712] rounded-lg p-2">
                        <p className="text-[#5a9070] text-[9px]">{label}</p>
                        <p className={`font-mono text-[11px] font-medium ${neg ? 'text-[#e53e3e]' : 'text-[#f0f5f3]'}`}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Score widget */}
                  <div className="flex items-center gap-3 bg-[#0b1712] rounded-xl p-3">
                    <div className="w-9 h-9 rounded-full border-2 border-[#00b894] flex items-center justify-center shrink-0">
                      <span className="font-mono text-[#00b894] text-xs font-medium">74</span>
                    </div>
                    <div>
                      <p className="text-[#5a9070] text-[10px]">Score Financiero</p>
                      <p className="text-[#f0f5f3] text-xs font-medium">Intermedio · ↑ +3 pts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Countries strip */}
        <div className="border-t border-[#1e3d2a]/50">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center gap-x-1 gap-y-3">
            <span className="text-[#2e5c3e] text-xs font-medium shrink-0 mr-4">
              Diseñado para tu región:
            </span>
            {[
              ['🇬🇹', 'Guatemala'],
              ['🇭🇳', 'Honduras'],
              ['🇸🇻', 'El Salvador'],
              ['🇨🇷', 'Costa Rica'],
              ['🇳🇮', 'Nicaragua'],
              ['🇵🇦', 'Panamá'],
              ['🇩🇴', 'Rep. Dominicana'],
              ['🇪🇨', 'Ecuador'],
            ].map(([flag, country], i, arr) => (
              <span key={country} className="flex items-center gap-1.5 text-[#5a9070]/60 text-xs">
                <span>{flag}</span>
                <span>{country}</span>
                {i < arr.length - 1 && (
                  <span className="ml-1 text-[#1e3d2a]">·</span>
                )}
              </span>
            ))}
            <span className="ml-2 text-[#2e5c3e] text-xs italic">y más próximamente</span>
          </div>
        </div>
      </section>

      {/* Horizon accent line */}
      <div className="h-px bg-[#00b894]" aria-hidden="true" />

      {/* ── Pain Points ── light ───────────────────────────────────────────── */}
      <section className="bg-[#f0f5f3] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-[#111816] leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              ¿Te suena familiar?
            </h2>
            <p className="font-sans text-[#6a8880] text-lg max-w-lg mx-auto">
              Si respondiste sí a alguno de estos, no estás solo. Es la realidad de millones en la región.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAINS.map((p) => (
              <div key={p.title}
                className="bg-white border border-[#d0e0da] rounded-2xl p-7 shadow-mf-sm hover:shadow-mf-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#e4f8f3] border border-[#c0f0e4] flex items-center justify-center mb-5">
                  <p.icon size={20} className="text-[#009a7a]" />
                </div>
                <h3 className="font-sans font-bold text-[#111816] text-lg leading-snug mb-3">{p.title}</h3>
                <p className="font-sans text-[#6a8880] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center font-sans text-[#6a8880] text-base max-w-2xl mx-auto leading-relaxed">
            No es falta de disciplina. Es falta de una herramienta diseñada para tu realidad.{' '}
            <span className="text-[#111816] font-medium">Las apps que existen no fueron hechas para Centroamérica ni el Caribe.</span>
          </p>
        </div>
      </section>

      {/* ── Features ── dark ──────────────────────────────────────────────── */}
      <section id="funciones" className="bg-[#0b1712] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00b894] text-xs font-medium uppercase tracking-widest mb-3">La solución</p>
            <h2 className="font-display font-semibold text-[#f0f5f3] leading-tight"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              Todo lo que necesitás para manejar tu dinero
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-[#152a1e] border border-[#1e3d2a] rounded-2xl p-6 hover:border-[#00b894]/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#0b1712] border border-[#1e3d2a] flex items-center justify-center mb-4 group-hover:border-[#00b894]/40 transition-colors">
                  <f.icon size={18} className="text-[#00b894]" />
                </div>
                <h3 className="font-sans font-bold text-[#f0f5f3] mb-2">{f.title}</h3>
                <p className="font-sans text-[#5a9070] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Remesas ── dark ───────────────────────────────────────────────── */}
      <section className="bg-[#0b1712] border-t border-[#1e3d2a] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#00b894] text-xs font-medium uppercase tracking-widest mb-4">
                Diferenciador regional
              </p>
              <h2 className="font-display font-semibold text-[#f0f5f3] leading-tight mb-6"
                style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.02em' }}>
                La única app que entiende que las remesas son tu ingreso
              </h2>
              <p className="font-sans text-[#5a9070] text-base leading-relaxed mb-6">
                Para millones de familias en toda Centroamérica —Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica, Panamá— y en países dolarizados del Caribe y América Latina como República Dominicana y Ecuador, las remesas no son un ingreso "extra": son la base del presupuesto mensual.
              </p>
              <p className="font-sans text-[#5a9070] text-base leading-relaxed mb-8">
                MoniFlow las trata como la categoría prioritaria que son: con origen, frecuencia y planificación integrada.
              </p>
              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { val: '55M+',    label: 'personas reciben remesas' },
                  { val: '15–25%',  label: 'del PIB en algunos países' },
                  { val: '8',       label: 'monedas de la región' },
                ].map((s) => (
                  <div key={s.val}>
                    <p className="font-mono text-[#00b894] text-2xl font-semibold">{s.val}</p>
                    <p className="font-sans text-[#5a9070] text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <a href={`${APP_URL}/register`}
                className="inline-flex items-center gap-2 text-[#00b894] hover:text-[#55d8b4] font-medium text-sm transition-colors group">
                Empezar a planificar mis remesas
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Remesas mockup card */}
            <div className="bg-[#152a1e] border border-[#1e3d2a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00b894]/15 border border-[#00b894]/30 flex items-center justify-center">
                  <Send size={16} className="text-[#00b894]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#5a9070] text-xs">Ingreso de remesa</p>
                  <p className="font-mono text-[#f0f5f3] font-medium">+ $350.00 USD</p>
                </div>
                <span className="text-[#00b894] text-xs font-medium">Mensual</span>
              </div>

              <div className="space-y-3.5">
                {[
                  ['Gastos del hogar', '40%', '$140.00'],
                  ['Deudas y cuotas',  '30%', '$105.00'],
                  ['Ahorro familiar',  '20%', '$70.00'],
                  ['Libre disposición','10%', '$35.00'],
                ].map(([label, pct, val]) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#5a9070]">{label}</span>
                      <span className="font-mono text-[#f0f5f3]">{val}</span>
                    </div>
                    <div className="h-1.5 bg-[#0b1712] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00b894]/55 rounded-full" style={{ width: pct }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#1e3d2a] flex items-center justify-between">
                <span className="text-[#5a9070] text-xs">Planificado este mes</span>
                <span className="text-[#00b894] text-xs font-medium">✓ 100% distribuido</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── light ────────────────────────────────────────── */}
      <section id="como-funciona" className="bg-[#f0f5f3] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-[#111816] leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              Empezá en 5 minutos
            </h2>
            <p className="font-sans text-[#6a8880] text-lg">Sin tutoriales largos. Sin configuraciones complicadas.</p>
          </div>

          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.n}
                className="bg-white border border-[#d0e0da] rounded-2xl p-6 flex items-start gap-5 shadow-mf-sm hover:shadow-mf-md transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-[#e4f8f3] border border-[#c0f0e4] flex items-center justify-center shrink-0">
                  <span className="font-mono text-[#00b894] font-semibold text-sm">{step.n}</span>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-[#111816] mb-1">{step.title}</h3>
                  <p className="font-sans text-[#6a8880] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── light ─────────────────────────────────────────── */}
      <section className="bg-[#f0f5f3] border-t border-[#d0e0da] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-[#111816] leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-white border border-[#d0e0da] rounded-2xl p-7 shadow-mf-sm relative overflow-hidden">
                <span className="font-display text-[72px] leading-none text-[#00b894]/12 absolute -top-2 left-3 select-none pointer-events-none">
                  "
                </span>
                <p className="font-sans text-[#2a3a36] text-sm leading-relaxed mb-6 relative z-10 mt-4">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#e4f8f3] border border-[#c0f0e4] flex items-center justify-center shrink-0">
                    <span className="font-sans font-bold text-[#00b894] text-xs">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-[#111816] text-sm">{t.name}</p>
                    <p className="font-sans text-[#00b894] text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { val: 'Hoy mismo', label: 'Para empezar a ver a dónde va tu dinero' },
              { val: '1 semana',  label: 'Para tener tu primer presupuesto completo' },
              { val: '1 mes',     label: 'Para sentir que realmente controlás tus finanzas' },
            ].map((s) => (
              <div key={s.val}>
                <p className="font-display font-semibold text-[#00b894] text-2xl mb-2">{s.val}</p>
                <p className="font-sans text-[#6a8880] text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparativa ── dark ───────────────────────────────────────────── */}
      <section className="bg-[#0b1712] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-[#f0f5f3] leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              ¿Por qué MoniFlow y no otra app?
            </h2>
            <p className="font-sans text-[#5a9070] text-lg max-w-xl mx-auto">
              Ninguna otra app fue diseñada desde el principio para la realidad financiera de Centroamérica y el Caribe.
            </p>
          </div>

          <div className="bg-[#152a1e] border border-[#1e3d2a] rounded-2xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_repeat(3,80px)] bg-[#1e3d2a]/50 border-b border-[#1e3d2a]">
              <div className="px-6 py-4" />
              {[['MoniFlow', true], ['Wallet BB', false], ['PocketSmith', false]].map(([name, highlight]) => (
                <div key={name}
                  className={`px-1 py-4 text-center text-xs font-semibold ${highlight ? 'text-[#00b894]' : 'text-[#5a9070]'}`}>
                  {name}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {COMPARISON.map((row, i) => (
              <div key={row.feature}
                className={`grid grid-cols-[1fr_repeat(3,80px)] border-b border-[#1e3d2a]/60 last:border-0 ${i % 2 === 1 ? 'bg-[#0b1712]/30' : ''}`}>
                <div className="px-6 py-4 font-sans text-[#5a9070] text-sm">{row.feature}</div>
                <div className="py-4 flex items-center justify-center"><CompCell val={row.mf} /></div>
                <div className="py-4 flex items-center justify-center"><CompCell val={row.wallet} /></div>
                <div className="py-4 flex items-center justify-center"><CompCell val={row.pocket} /></div>
              </div>
            ))}
          </div>

          <p className="text-center text-[#2e5c3e] text-xs mt-3">
            — = parcialmente disponible · Fuentes: sitios oficiales y centros de ayuda de cada app
          </p>
          <p className="text-center font-sans text-[#5a9070] text-sm mt-4 max-w-xl mx-auto leading-relaxed">
            PocketSmith tiene flujo de caja y amortización, pero está en inglés y sus precios (desde $17/mes) no son accesibles para nuestra región. Wallet BB tiene español pero carece de módulo de deudas real. MoniFlow combina ambos, en español, al precio correcto.
          </p>
        </div>
      </section>

      {/* ── Calculadoras ── dark ─────────────────────────────────────────── */}
      <section id="calculadoras" className="bg-[#152a1e] border-t border-[#1e3d2a] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#00b894] text-xs font-medium uppercase tracking-widest mb-3">Herramientas gratuitas</p>
            <h2 className="font-display font-semibold text-[#f0f5f3] leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              Calculadoras que te ayudan hoy
            </h2>
            <p className="font-sans text-[#5a9070] text-lg max-w-lg mx-auto">
              Sin registrarte. Úsalas ahora y luego impórtalas a tu cuenta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CALCULADORAS.map((c) => (
              <button key={c.title}
                onClick={() => setActiveCalc(c.calcType)}
                className="text-left bg-[#0b1712] border border-[#1e3d2a] rounded-2xl p-6 hover:border-[#00b894]/30 hover:-translate-y-1 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00b894]/40">
                <div className="w-10 h-10 rounded-xl bg-[#152a1e] border border-[#1e3d2a] flex items-center justify-center mb-4 group-hover:border-[#00b894]/40 transition-colors">
                  <c.icon size={18} className="text-[#00b894]" />
                </div>
                <h3 className="font-sans font-bold text-[#f0f5f3] text-sm leading-snug mb-2">{c.title}</h3>
                <p className="font-sans text-[#5a9070] text-xs leading-relaxed">{c.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[#00b894] text-xs font-medium group-hover:gap-2 transition-all">
                  Abrir calculadora <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ── dark ───────────────────────────────────────────────── */}
      <section id="precios" className="bg-[#0b1712] border-t border-[#1e3d2a] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-[#f0f5f3] leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              Un plan para cada momento de tu vida financiera
            </h2>
            <p className="font-sans text-[#5a9070] text-lg">Empezá gratis. Escalá cuando lo necesités.</p>
          </div>
          <PricingSection />
        </div>
      </section>

      {/* ── FAQ ── light ──────────────────────────────────────────────────── */}
      <section id="faq" className="bg-[#f0f5f3] border-t border-[#d0e0da] py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#00b894] text-xs font-medium uppercase tracking-widest mb-3">Preguntas frecuentes</p>
            <h2 className="font-display font-semibold text-[#111816] leading-tight"
              style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
              Todo lo que necesitás saber
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q}
                className="group bg-white border border-[#d0e0da] rounded-2xl overflow-hidden shadow-mf-sm">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                  <span className="font-sans font-semibold text-[#111816] text-sm leading-snug pr-4">{faq.q}</span>
                  <ChevronRight size={16} className="text-[#00b894] shrink-0" />
                </summary>
                <div className="px-6 pb-5 border-t border-[#f0f5f3]">
                  <p className="font-sans text-[#6a8880] text-sm leading-relaxed pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── dark ─────────────────────────────────────────────── */}
      <section className="bg-[#0b1712] border-t border-[#1e3d2a] py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-10 h-0.5 bg-[#00b894] mx-auto mb-10 rounded-full" />

          <h2 className="font-display font-semibold text-[#f0f5f3] leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-0.02em' }}>
            Empezá hoy.<br />30 días gratis en Pro.
          </h2>

          <p className="font-sans text-[#5a9070] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Únete a los miles de personas en Centroamérica y el Caribe que ya saben exactamente a dónde va su dinero cada mes.
          </p>

          <a href={`${APP_URL}/register?plan=pro`}
            className="group inline-flex items-center gap-2 px-9 py-4 bg-[#00b894] hover:bg-[#55d8b4] text-[#001e18] font-bold rounded-lg transition-all shadow-caribe hover:-translate-y-0.5 text-base">
            Empezar 30 días gratis
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </a>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-[#2e5c3e]">
            {['30 días completos en Pro', 'Sin cobro si cancelás antes', 'Listo en minutos', 'Cancelá cuando quieras'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#00b894]" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile App ── dark ───────────────────────────────────────────── */}
      <section className="bg-[#0b1712] border-t border-[#1e3d2a] py-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#152a1e] border border-[#2e5c3e] text-[#00b894] text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b894] animate-pulse" />
                En desarrollo
              </span>

              <h2 className="font-display font-semibold text-[#f0f5f3] leading-[1.05] mb-4"
                style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.02em' }}>
                MoniFlow en tu bolsillo.<br />
                <span className="text-[#00b894]">Muy pronto.</span>
              </h2>

              <p className="font-sans text-[#5a9070] text-base leading-relaxed mb-8 max-w-md">
                La app ya está disponible en web. Las versiones para iOS y Android están en camino —
                diseñadas para que puedas registrar un gasto, revisar tu flujo de caja o fotografiar un recibo
                en cualquier momento, desde donde estés.
              </p>

              {/* Store badges (placeholder) */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { label: 'App Store', sub: 'Próximamente para iPhone', icon: '⬢' },
                  { label: 'Google Play', sub: 'Próximamente para Android', icon: '⬡' },
                ].map((store) => (
                  <div key={store.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#152a1e] border border-[#1e3d2a] opacity-60 cursor-not-allowed select-none">
                    <Smartphone size={20} className="text-[#5a9070] shrink-0" />
                    <div>
                      <p className="font-sans font-semibold text-[#f0f5f3] text-sm leading-none">{store.label}</p>
                      <p className="font-sans text-[#5a9070] text-xs mt-0.5">{store.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notify CTA */}
              <button
                onClick={() => setShowNotify(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#00b894]/40 text-[#00b894] hover:bg-[#00b894]/10 text-sm font-medium transition-colors">
                <Bell size={14} />
                Avísame cuando esté disponible
              </button>
              <p className="font-sans text-[#2e5c3e] text-xs mt-3">
                Crea tu cuenta hoy y te notificamos el día que lancemos.
              </p>
            </div>

            {/* Right: phone wireframe illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-[#00b894]/10 blur-3xl rounded-full pointer-events-none" />

                {/* Two phone frames */}
                <div className="relative flex items-end gap-4">
                  {/* Back phone (Android) */}
                  <div className="w-[130px] bg-[#152a1e] border border-[#1e3d2a] rounded-[22px] p-3 mb-6 opacity-60"
                    style={{ transform: 'perspective(800px) rotateY(8deg) rotateX(-2deg)' }}>
                    <div className="w-6 h-1 bg-[#1e3d2a] rounded-full mx-auto mb-3" />
                    <div className="space-y-2">
                      <div className="h-2 bg-[#1e3d2a] rounded-full w-3/4" />
                      <div className="h-6 bg-[#0b1712] rounded-lg" />
                      <div className="grid grid-cols-2 gap-1.5">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-10 bg-[#0b1712] rounded-lg" />
                        ))}
                      </div>
                      <div className="h-2 bg-[#1e3d2a] rounded-full w-1/2" />
                      <div className="flex gap-1 items-end h-8">
                        {[40, 65, 50, 80, 60].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm"
                            style={{ height: `${h}%`, background: i === 3 ? 'rgba(0,184,148,0.4)' : 'rgba(0,184,148,0.15)' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Front phone (iOS) */}
                  <div className="w-[150px] bg-[#152a1e] border border-[#2e5c3e] rounded-[26px] p-3 shadow-caribe-lg"
                    style={{ transform: 'perspective(800px) rotateY(-4deg) rotateX(1deg)' }}>
                    {/* Notch */}
                    <div className="w-8 h-1.5 bg-[#0b1712] rounded-full mx-auto mb-3" />
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="h-2 bg-[#2e5c3e] rounded-full w-1/2" />
                        <div className="w-6 h-6 rounded-full bg-[#00b894]/20 border border-[#00b894]/30" />
                      </div>
                      {/* Balance */}
                      <div className="bg-[#0b1712] rounded-xl p-2.5">
                        <div className="h-1.5 bg-[#1e3d2a] rounded-full w-1/2 mb-1.5" />
                        <div className="h-3 bg-[#00b894]/30 rounded-full w-3/4" />
                        <div className="h-1.5 bg-[#00b894]/50 rounded-full w-1/3 mt-1" />
                      </div>
                      {/* Chart */}
                      <div className="flex gap-1 items-end h-10">
                        {[35, 55, 45, 70, 50, 85, 65].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm"
                            style={{ height: `${h}%`, background: i === 5 ? '#00b894' : 'rgba(0,184,148,0.2)' }} />
                        ))}
                      </div>
                      {/* Cards */}
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded bg-[#1e3d2a]" />
                          <div className="h-1.5 bg-[#1e3d2a] rounded-full flex-1" />
                          <div className="h-1.5 bg-[#2e5c3e] rounded-full w-8" />
                        </div>
                      ))}
                    </div>
                    {/* Home bar */}
                    <div className="w-8 h-1 bg-[#2e5c3e] rounded-full mx-auto mt-3" />
                  </div>
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-3 px-2">
                  <span className="font-sans text-[#2e5c3e] text-[10px]">Android</span>
                  <span className="font-sans text-[#5a9070] text-[10px]">iOS</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#060e0a] border-t border-[#00b894]/20 py-16 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Brand + columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <a href="/" className="flex items-center mb-4">
                <img src="/logos/moniflow-02-logo-dark.svg" style={{ height: '26px', width: 'auto' }} alt="MoniFlow" />
              </a>
              <p className="font-sans text-xs text-[#5a9070] leading-relaxed max-w-xs">
                La app de finanzas personales para Centroamérica y el Caribe. Gastos, tarjetas, deudas y metas en un solo lugar.
              </p>
            </div>

            {/* Producto */}
            <div>
              <p className="font-sans text-xs font-semibold text-[#f0f5f3]/50 uppercase tracking-wider mb-4">Producto</p>
              <ul className="space-y-2.5">
                {[['Funciones', '#funciones'], ['Precios', '#precios'], ['Calculadoras', '#calculadoras'], ['Empezar gratis', `${APP_URL}/register`]].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="font-sans text-sm text-[#f0f5f3]/35 hover:text-[#f0f5f3]/65 transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* País */}
            <div>
              <p className="font-sans text-xs font-semibold text-[#f0f5f3]/50 uppercase tracking-wider mb-4">País</p>
              <ul className="space-y-2.5">
                {['Guatemala', 'Honduras', 'El Salvador', 'Costa Rica', 'Nicaragua', 'Panamá'].map((c) => (
                  <li key={c}>
                    <span className="font-sans text-sm text-[#f0f5f3]/35">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <p className="font-sans text-xs font-semibold text-[#f0f5f3]/50 uppercase tracking-wider mb-4">Empresa</p>
              <ul className="space-y-2.5">
                {[['Iniciar sesión', `${APP_URL}/login`], ['Privacidad', '/privacidad'], ['Términos', '/terminos']].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="font-sans text-sm text-[#f0f5f3]/35 hover:text-[#f0f5f3]/65 transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#152a1e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-sans text-xs text-[#f0f5f3]/20">
              © 2026 MoniFlow · Todos los derechos reservados
            </p>
            <p className="font-sans text-xs text-[#5a9070]/50">
              Hecho en Centroamérica, para Centroamérica y el Caribe.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Modales ───────────────────────────────────────────────────────── */}
      {activeCalc && (
        <CalcModal type={activeCalc} onClose={() => setActiveCalc(null)} />
      )}
      {showNotify && (
        <NotifyModal onClose={() => setShowNotify(false)} />
      )}

    </div>
  );
}
