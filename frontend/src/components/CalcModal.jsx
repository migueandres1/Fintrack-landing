import { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { submitLead } from '../services/api.js';

// ── Formatting ──────────────────────────────────────────────────────────────
const fmt$ = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtMonths = (n) => {
  const m = Math.ceil(n);
  if (m <= 0) return '—';
  if (m < 12) return `${m} mes${m === 1 ? '' : 'es'}`;
  const y = Math.floor(m / 12);
  const r = m % 12;
  return r === 0
    ? `${y} año${y === 1 ? '' : 's'}`
    : `${y} año${y === 1 ? '' : 's'} y ${r} mes${r === 1 ? '' : 'es'}`;
};

// ── Calculator logic ─────────────────────────────────────────────────────────

function calcCreditCard({ balance, annualRate, payment }) {
  const r = annualRate / 100 / 12;
  const bal = parseFloat(balance);
  const pmt = parseFloat(payment);
  const minInterest = bal * r;

  if (pmt <= minInterest) {
    return { error: `Tu pago mensual debe ser mayor a ${fmt$(minInterest)} para reducir el saldo.` };
  }

  function iterate(b, monthlyPmt) {
    let months = 0; let totalInterest = 0; let current = b;
    while (current > 0.005 && months < 600) {
      const interest = current * r;
      totalInterest += interest;
      const paid = Math.min(monthlyPmt, current + interest);
      current = current + interest - paid;
      months++;
    }
    return { months, totalInterest, totalPaid: totalInterest + b };
  }

  function iterateMin(b) {
    let months = 0; let totalInterest = 0; let current = b;
    while (current > 0.005 && months < 600) {
      const interest = current * r;
      totalInterest += interest;
      const minPmt = Math.max(current * 0.025 + interest, 25);
      const paid = Math.min(minPmt, current + interest);
      current = current + interest - paid;
      months++;
    }
    return { months, totalInterest, totalPaid: totalInterest + b };
  }

  return {
    user: iterate(bal, pmt),
    min: iterateMin(bal),
  };
}

function calcSnowball({ debts, extra }) {
  const extraAmt = parseFloat(extra) || 0;

  function runStrategy(sorted) {
    let ds = debts.map((d) => ({ ...d, balance: parseFloat(d.balance) }));
    let totalInterest = 0;
    let months = 0;

    while (ds.some((d) => d.balance > 0.005) && months < 600) {
      months++;
      // Pay interest + minimums
      ds = ds.map((d) => {
        if (d.balance <= 0) return d;
        const interest = d.balance * (parseFloat(d.rate) / 100 / 12);
        totalInterest += interest;
        const minPmt = Math.min(parseFloat(d.minPayment), d.balance + interest);
        return { ...d, balance: d.balance + interest - minPmt };
      });

      // Apply extra to target debt
      const remaining = ds
        .filter((d) => d.balance > 0)
        .sort(sorted);
      if (remaining.length > 0) {
        const targetName = remaining[0].name;
        let extraLeft = extraAmt;
        ds = ds.map((d) => {
          if (d.name !== targetName || extraLeft <= 0) return d;
          const applied = Math.min(extraLeft, d.balance);
          extraLeft -= applied;
          return { ...d, balance: d.balance - applied };
        });
      }
    }
    return { months, totalInterest };
  }

  const snowball = runStrategy((a, b) => a.balance - b.balance);
  const avalanche = runStrategy((a, b) => parseFloat(b.rate) - parseFloat(a.rate));

  return { snowball, avalanche };
}

function calcSavings({ goal, current, months, annualRate }) {
  const G = parseFloat(goal);
  const S = parseFloat(current) || 0;
  const n = parseInt(months);
  const r = parseFloat(annualRate) / 100 / 12;
  const needed = Math.max(0, G - S);

  let monthly;
  if (r === 0 || !annualRate || annualRate === '0') {
    monthly = needed / n;
  } else {
    const factor = Math.pow(1 + r, n);
    const pvGrowth = S * factor;
    monthly = Math.max(0, (G - pvGrowth) * r / (factor - 1));
  }

  const totalContrib = monthly * n;
  const totalWithCurrent = S + totalContrib;

  return { monthly, totalContrib, totalWithCurrent, shortfall: G - totalWithCurrent };
}

function calcAmortization({ principal, annualRate, termMonths }) {
  const P = parseFloat(principal);
  const r = parseFloat(annualRate) / 100 / 12;
  const n = parseInt(termMonths);
  const payment = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));

  let balance = P;
  const table = [];
  let totalInterest = 0;

  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    table.push({ month: i, payment, principalPaid, interest, balance });
  }

  return { payment, totalInterest, totalPaid: payment * n, table };
}

// ── Tool config ──────────────────────────────────────────────────────────────
const TOOLS = {
  'credit-card': {
    label: 'Calculadora de tarjeta de crédito',
    desc: 'Descubrí cuánto te cuesta pagar solo el mínimo y cuándo terminarías.',
  },
  'snowball': {
    label: 'Simulador snowball / avalanche',
    desc: 'Compará estrategias para salir de deudas más rápido.',
  },
  'savings': {
    label: 'Calculadora de meta de ahorro',
    desc: 'Calculá cuánto ahorro mensual necesitás para llegar a tu meta.',
  },
  'amortization': {
    label: 'Tabla de amortización',
    desc: 'Desglose cuota por cuota de tu préstamo.',
  },
};

// ── Input component ──────────────────────────────────────────────────────────
function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#333] mb-1">{label}</label>
      {hint && <p className="text-[10px] text-[#999] mb-1">{hint}</p>}
      <input
        {...props}
        className="w-full border border-[#d0e0da] rounded-lg px-3 py-2.5 text-sm text-[#111816] focus:outline-none focus:border-[#00b894] focus:ring-1 focus:ring-[#00b894]/30 transition-colors bg-white placeholder:text-[#bbb]"
      />
    </div>
  );
}

// ── Step: forms ──────────────────────────────────────────────────────────────
function CreditCardForm({ values, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Saldo actual de la tarjeta ($)"
        type="number" min="1" step="0.01" required
        placeholder="ej. 2500.00"
        value={values.balance} onChange={(e) => onChange('balance', e.target.value)}
      />
      <Field
        label="Tasa de interés anual (%)"
        hint="Típico en Centroamérica: 30–55 %"
        type="number" min="1" max="150" step="0.1" required
        placeholder="ej. 36"
        value={values.annualRate} onChange={(e) => onChange('annualRate', e.target.value)}
      />
      <Field
        label="¿Cuánto podés pagar por mes? ($)"
        type="number" min="1" step="0.01" required
        placeholder="ej. 150.00"
        value={values.payment} onChange={(e) => onChange('payment', e.target.value)}
      />
      <button type="submit"
        className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] text-[#001e18] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
        Calcular <ArrowRight size={15} />
      </button>
    </form>
  );
}

function SnowballForm({ values, onChange, onSubmit }) {
  const addDebt = () => {
    if (values.debts.length >= 5) return;
    onChange('debts', [...values.debts, { name: '', balance: '', rate: '', minPayment: '' }]);
  };
  const removeDebt = (i) => {
    if (values.debts.length <= 2) return;
    onChange('debts', values.debts.filter((_, idx) => idx !== i));
  };
  const updateDebt = (i, field, val) => {
    const updated = values.debts.map((d, idx) => idx === i ? { ...d, [field]: val } : d);
    onChange('debts', updated);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        {values.debts.map((d, i) => (
          <div key={i} className="bg-[#f8fdf9] border border-[#d0e0da] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#00b894]">Deuda {i + 1}</span>
              {values.debts.length > 2 && (
                <button type="button" onClick={() => removeDebt(i)}
                  className="text-[#e53e3e] hover:text-[#c53030]">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Field label="Nombre" type="text" required placeholder="ej. Visa BAC"
                  value={d.name} onChange={(e) => updateDebt(i, 'name', e.target.value)} />
              </div>
              <Field label="Saldo ($)" type="number" min="1" step="0.01" required placeholder="5000"
                value={d.balance} onChange={(e) => updateDebt(i, 'balance', e.target.value)} />
              <Field label="Tasa anual (%)" type="number" min="0.1" max="150" step="0.1" required placeholder="36"
                value={d.rate} onChange={(e) => updateDebt(i, 'rate', e.target.value)} />
              <div className="col-span-2">
                <Field label="Pago mínimo mensual ($)" type="number" min="1" step="0.01" required placeholder="250"
                  value={d.minPayment} onChange={(e) => updateDebt(i, 'minPayment', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {values.debts.length < 5 && (
        <button type="button" onClick={addDebt}
          className="w-full py-2 border border-dashed border-[#00b894]/50 text-[#00b894] text-xs font-semibold rounded-lg hover:bg-[#00b894]/5 transition-colors flex items-center justify-center gap-1">
          <Plus size={13} /> Agregar deuda
        </button>
      )}
      <Field
        label="Pago adicional mensual disponible ($)"
        hint="Dinero extra que podés aplicar para salir de deudas más rápido"
        type="number" min="0" step="0.01" required placeholder="100"
        value={values.extra} onChange={(e) => onChange('extra', e.target.value)}
      />
      <button type="submit"
        className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] text-[#001e18] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
        Simular <ArrowRight size={15} />
      </button>
    </form>
  );
}

function SavingsForm({ values, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="¿Cuánto necesitás ahorrar? ($)"
        type="number" min="1" step="0.01" required
        placeholder="ej. 5000.00"
        value={values.goal} onChange={(e) => onChange('goal', e.target.value)}
      />
      <Field
        label="¿Ya tenés algo ahorrado? ($)"
        type="number" min="0" step="0.01"
        placeholder="ej. 500.00 (0 si empezás de cero)"
        value={values.current} onChange={(e) => onChange('current', e.target.value)}
      />
      <Field
        label="¿En cuántos meses querés llegar?"
        type="number" min="1" max="600" step="1" required
        placeholder="ej. 24"
        value={values.months} onChange={(e) => onChange('months', e.target.value)}
      />
      <Field
        label="Rendimiento anual estimado (%) — opcional"
        hint="Dejá en 0 si guardás el dinero en una cuenta sin interés"
        type="number" min="0" max="30" step="0.1"
        placeholder="ej. 4 (0 si no aplica)"
        value={values.annualRate} onChange={(e) => onChange('annualRate', e.target.value)}
      />
      <button type="submit"
        className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] text-[#001e18] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
        Calcular <ArrowRight size={15} />
      </button>
    </form>
  );
}

function AmortizationForm({ values, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Monto del préstamo ($)"
        type="number" min="1" step="0.01" required
        placeholder="ej. 10000.00"
        value={values.principal} onChange={(e) => onChange('principal', e.target.value)}
      />
      <Field
        label="Tasa de interés anual (%)"
        hint="Revisá tu contrato de préstamo para la tasa exacta"
        type="number" min="0.1" max="150" step="0.1" required
        placeholder="ej. 18"
        value={values.annualRate} onChange={(e) => onChange('annualRate', e.target.value)}
      />
      <Field
        label="Plazo en meses"
        type="number" min="1" max="360" step="1" required
        placeholder="ej. 24"
        value={values.termMonths} onChange={(e) => onChange('termMonths', e.target.value)}
      />
      <button type="submit"
        className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] text-[#001e18] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
        Generar tabla <ArrowRight size={15} />
      </button>
    </form>
  );
}

// ── Step: results ────────────────────────────────────────────────────────────
function ResultCard({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-[#00b894]/10 border border-[#00b894]/30' : 'bg-[#f8fdf9] border border-[#e0ede8]'}`}>
      <p className="text-xs text-[#6a8880] mb-1">{label}</p>
      <p className={`font-mono font-bold text-lg ${highlight ? 'text-[#007a62]' : 'text-[#111816]'}`}>{value}</p>
      {sub && <p className="text-xs text-[#999] mt-0.5">{sub}</p>}
    </div>
  );
}

function CreditCardResults({ results }) {
  if (results.error) return <p className="text-[#e53e3e] text-sm">{results.error}</p>;
  const { user, min } = results;
  const savedInterest = min.totalInterest - user.totalInterest;
  const savedMonths = min.months - user.months;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-[#00b894] uppercase tracking-widest mb-3">Con tu pago mensual</p>
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Tiempo para pagar" value={fmtMonths(user.months)} highlight />
          <ResultCard label="Total a pagar" value={fmt$(user.totalPaid)} />
          <ResultCard label="Total de intereses" value={fmt$(user.totalInterest)} />
        </div>
      </div>
      <div className="border-t border-[#e0ede8] pt-4">
        <p className="text-xs font-bold text-[#e53e3e] uppercase tracking-widest mb-3">Si solo pagás el mínimo</p>
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Tiempo para pagar" value={fmtMonths(min.months)} />
          <ResultCard label="Total de intereses" value={fmt$(min.totalInterest)} />
        </div>
      </div>
      {savedInterest > 0 && (
        <div className="bg-[#e4f8f3] border border-[#00b894]/30 rounded-xl p-4">
          <p className="text-xs font-bold text-[#007a62] mb-1">¡Pagando más ahorrás:</p>
          <p className="font-mono font-bold text-[#007a62] text-lg">{fmt$(savedInterest)} en intereses</p>
          <p className="text-xs text-[#5a9070] mt-0.5">y terminás {fmtMonths(savedMonths)} antes</p>
        </div>
      )}
    </div>
  );
}

function SnowballResults({ results }) {
  const { snowball, avalanche } = results;
  const better = avalanche.totalInterest <= snowball.totalInterest ? 'avalanche' : 'snowball';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-4 border ${better === 'snowball' ? 'bg-[#00b894]/10 border-[#00b894]/40' : 'bg-[#f8fdf9] border-[#e0ede8]'}`}>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-bold text-[#111816]">Snowball</span>
            {better === 'snowball' && <span className="text-[10px] bg-[#00b894] text-white px-1.5 rounded-full">recomendado</span>}
          </div>
          <p className="text-[10px] text-[#999] mb-3">Paga la deuda más pequeña primero</p>
          <p className="font-mono font-bold text-[#111816]">{fmtMonths(snowball.months)}</p>
          <p className="text-xs text-[#6a8880]">para salir de deudas</p>
          <p className="font-mono font-semibold text-[#e53e3e] text-sm mt-2">{fmt$(snowball.totalInterest)}</p>
          <p className="text-xs text-[#6a8880]">en intereses totales</p>
        </div>
        <div className={`rounded-xl p-4 border ${better === 'avalanche' ? 'bg-[#00b894]/10 border-[#00b894]/40' : 'bg-[#f8fdf9] border-[#e0ede8]'}`}>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-bold text-[#111816]">Avalanche</span>
            {better === 'avalanche' && <span className="text-[10px] bg-[#00b894] text-white px-1.5 rounded-full">recomendado</span>}
          </div>
          <p className="text-[10px] text-[#999] mb-3">Paga la tasa más alta primero</p>
          <p className="font-mono font-bold text-[#111816]">{fmtMonths(avalanche.months)}</p>
          <p className="text-xs text-[#6a8880]">para salir de deudas</p>
          <p className="font-mono font-semibold text-[#e53e3e] text-sm mt-2">{fmt$(avalanche.totalInterest)}</p>
          <p className="text-xs text-[#6a8880]">en intereses totales</p>
        </div>
      </div>
      <div className="bg-[#f8fdf9] rounded-xl p-4 border border-[#e0ede8]">
        <p className="text-xs text-[#6a8880] leading-relaxed">
          <strong className="text-[#111816]">Snowball:</strong> mejor si necesitás motivación — ves deudas desaparecer rápido.
          {' '}<strong className="text-[#111816]">Avalanche:</strong> mejor matemáticamente — pagás menos intereses en total.
        </p>
      </div>
    </div>
  );
}

function SavingsResults({ results }) {
  const { monthly, totalContrib, totalWithCurrent, shortfall } = results;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ResultCard label="Ahorro mensual necesario" value={fmt$(monthly)} highlight />
        <ResultCard label="Total que aportarías" value={fmt$(totalContrib)} />
        <ResultCard label="Total acumulado (aprox.)" value={fmt$(totalWithCurrent)} />
      </div>
      {Math.abs(shortfall) > 0.5 && (
        <div className="bg-[#fff8e0] border border-[#f0a500]/30 rounded-xl p-4">
          <p className="text-xs text-[#7a5c00]">
            {shortfall > 0
              ? `Con este plan te faltarían ${fmt$(shortfall)} para llegar a tu meta.`
              : `¡Superarías tu meta por ${fmt$(Math.abs(shortfall))}!`}
          </p>
        </div>
      )}
      <p className="text-xs text-[#6a8880] leading-relaxed pt-1">
        Resultado estimado. Rendimientos reales pueden variar según el instrumento de ahorro.
      </p>
    </div>
  );
}

function AmortizationResults({ results }) {
  const { payment, totalInterest, totalPaid, table } = results;
  const preview = table.length <= 12 ? table : [...table.slice(0, 6), null, table[table.length - 1]];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <ResultCard label="Cuota mensual" value={fmt$(payment)} highlight />
        <ResultCard label="Total intereses" value={fmt$(totalInterest)} />
        <ResultCard label="Total a pagar" value={fmt$(totalPaid)} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#e0ede8]">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#f0f5f3]">
              {['Mes', 'Cuota', 'Capital', 'Interés', 'Saldo'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-[#444]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) =>
              row === null ? (
                <tr key="ellipsis">
                  <td colSpan={5} className="px-3 py-2 text-center text-[#bbb] text-[10px]">
                    ··· {table.length - 7} meses más ···
                  </td>
                </tr>
              ) : (
                <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fdf9]'}>
                  <td className="px-3 py-2 font-mono text-[#666]">{row.month}</td>
                  <td className="px-3 py-2 font-mono">{fmt$(row.payment)}</td>
                  <td className="px-3 py-2 font-mono text-[#007a62]">{fmt$(row.principalPaid)}</td>
                  <td className="px-3 py-2 font-mono text-[#e53e3e]">{fmt$(row.interest)}</td>
                  <td className="px-3 py-2 font-mono">{fmt$(row.balance)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {table.length > 12 && (
        <p className="text-[10px] text-[#999] text-center">
          Mostrando primeros 6 meses + último mes. Tabla completa de {table.length} cuotas disponible en MoniFlow Pro.
        </p>
      )}
    </div>
  );
}

// ── Initial form values ──────────────────────────────────────────────────────
const INITIAL = {
  'credit-card':  { balance: '', annualRate: '36', payment: '' },
  'snowball':     { debts: [{ name: '', balance: '', rate: '', minPayment: '' }, { name: '', balance: '', rate: '', minPayment: '' }], extra: '100' },
  'savings':      { goal: '', current: '0', months: '', annualRate: '0' },
  'amortization': { principal: '', annualRate: '18', termMonths: '24' },
};

// ── Format inputs for email ──────────────────────────────────────────────────
function formatInputs(type, values) {
  if (type === 'credit-card') return {
    'Saldo': `$${values.balance}`, 'Tasa anual': `${values.annualRate}%`, 'Pago mensual': `$${values.payment}`,
  };
  if (type === 'snowball') {
    const obj = {};
    values.debts.forEach((d, i) => {
      obj[`Deuda ${i + 1}`] = `${d.name} — $${d.balance} al ${d.rate}% (mín $${d.minPayment}/mes)`;
    });
    obj['Pago extra'] = `$${values.extra}/mes`;
    return obj;
  }
  if (type === 'savings') return {
    'Meta': `$${values.goal}`, 'Ahorrado': `$${values.current}`, 'Plazo': `${values.months} meses`, 'Rendimiento': `${values.annualRate}%`,
  };
  if (type === 'amortization') return {
    'Capital': `$${values.principal}`, 'Tasa anual': `${values.annualRate}%`, 'Plazo': `${values.termMonths} meses`,
  };
  return {};
}

const CALCS = {
  'credit-card':  calcCreditCard,
  'snowball':     calcSnowball,
  'savings':      calcSavings,
  'amortization': calcAmortization,
};

// ── Main component ───────────────────────────────────────────────────────────
export default function CalcModal({ type, onClose }) {
  const [step, setStep]         = useState('form');
  const [values, setValues]     = useState(INITIAL[type]);
  const [results, setResults]   = useState(null);
  const [lead, setLead]         = useState({ name: '', email: '' });
  const [submitting, setSubmit] = useState(false);
  const [apiErr, setApiErr]     = useState('');
  const [formErr, setFormErr]   = useState('');

  const tool = TOOLS[type];

  const handleChange = (field, val) =>
    setValues((v) => ({ ...v, [field]: val }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormErr('');
    const computed = CALCS[type](values);
    if (computed.error) { setFormErr(computed.error); return; }
    setResults(computed);
    setStep('lead');
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);
    setApiErr('');
    try {
      await submitLead({ name: lead.name, email: lead.email, tool: type, inputs: formatInputs(type, values) });
      setStep('result');
    } catch {
      setApiErr('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setSubmit(false);
    }
  };

  const stepLabels = ['Datos', 'Tu info', 'Resultado'];
  const stepIndex  = step === 'form' ? 0 : step === 'lead' ? 1 : 2;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white sm:rounded-2xl shadow-2xl overflow-hidden rounded-t-2xl">

        {/* Header */}
        <div className="bg-[#0b1712] px-6 py-5 flex items-start justify-between shrink-0">
          <div>
            <p className="text-[#00b894] text-[10px] font-semibold uppercase tracking-widest mb-1">Herramienta gratuita</p>
            <h2 className="text-[#f0f5f3] font-bold text-base leading-tight">{tool.label}</h2>
          </div>
          <button onClick={onClose} className="text-[#5a9070] hover:text-[#f0f5f3] transition-colors ml-4 mt-0.5 shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-[#e0ede8] shrink-0">
          {stepLabels.map((label, i) => (
            <div key={label} className={`flex-1 py-2 text-center text-xs font-semibold transition-colors ${i === stepIndex ? 'text-[#00b894] border-b-2 border-[#00b894]' : i < stepIndex ? 'text-[#00b894]/50' : 'text-[#ccc]'}`}>
              {label}
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {step === 'form' && (
            <>
              <p className="text-sm text-[#6a8880] mb-5">{tool.desc}</p>
              {formErr && <p className="text-[#e53e3e] text-xs mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formErr}</p>}
              {type === 'credit-card'  && <CreditCardForm  values={values} onChange={handleChange} onSubmit={handleFormSubmit} />}
              {type === 'snowball'     && <SnowballForm     values={values} onChange={handleChange} onSubmit={handleFormSubmit} />}
              {type === 'savings'      && <SavingsForm      values={values} onChange={handleChange} onSubmit={handleFormSubmit} />}
              {type === 'amortization' && <AmortizationForm values={values} onChange={handleChange} onSubmit={handleFormSubmit} />}
            </>
          )}

          {step === 'lead' && (
            <form onSubmit={handleLeadSubmit} className="space-y-5">
              <div className="bg-[#e4f8f3] border border-[#00b894]/30 rounded-xl p-4 text-center">
                <CheckCircle2 size={28} className="text-[#00b894] mx-auto mb-2" />
                <p className="font-bold text-[#0b1712] text-sm">¡Tu resultado está listo!</p>
                <p className="text-xs text-[#5a9070] mt-1">Ingresá tu nombre y correo para verlo.</p>
              </div>
              <Field
                label="Tu nombre"
                type="text" required placeholder="ej. María García"
                value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
              />
              <Field
                label="Tu correo electrónico"
                type="email" required placeholder="ej. maria@correo.com"
                value={lead.email} onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
              />
              <p className="text-[10px] text-[#bbb] leading-relaxed">
                Solo usamos tu correo para enviarte ocasionalmente novedades de MoniFlow. Sin spam.
              </p>
              {apiErr && <p className="text-[#e53e3e] text-xs">{apiErr}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] disabled:opacity-60 text-[#001e18] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                {submitting ? 'Enviando…' : <>Ver mi resultado <ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {step === 'result' && results && (
            <div className="space-y-5">
              <p className="text-xs text-[#5a9070]">Resultado generado para <strong className="text-[#111816]">{lead.name}</strong></p>
              {type === 'credit-card'  && <CreditCardResults  results={results} />}
              {type === 'snowball'     && <SnowballResults     results={results} />}
              {type === 'savings'      && <SavingsResults      results={results} />}
              {type === 'amortization' && <AmortizationResults results={results} />}
              <div className="border-t border-[#e0ede8] pt-4">
                <p className="text-xs text-[#6a8880] mb-3">¿Querés hacer seguimiento en tiempo real?</p>
                <a href="https://app.moniflow.com/register?plan=pro"
                  className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] text-[#001e18] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                  Probá MoniFlow Pro 30 días gratis <ArrowRight size={15} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
