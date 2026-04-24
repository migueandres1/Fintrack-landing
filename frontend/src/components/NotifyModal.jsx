import { useState } from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';
import { submitLead } from '../services/api.js';

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#333] mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-[#d0e0da] rounded-lg px-3 py-2.5 text-sm text-[#111816] focus:outline-none focus:border-[#00b894] focus:ring-1 focus:ring-[#00b894]/30 transition-colors bg-white placeholder:text-[#bbb]"
      />
    </div>
  );
}

export default function NotifyModal({ onClose }) {
  const [lead, setLead]         = useState({ name: '', email: '' });
  const [submitting, setSubmit] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);
    setError('');
    try {
      await submitLead({ name: lead.name, email: lead.email, tool: 'notify-app' });
      setDone(true);
    } catch {
      setError('Ocurrió un error. Por favor intentá de nuevo.');
    } finally {
      setSubmit(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="relative w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0b1712] px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00b894]/15 border border-[#00b894]/30 flex items-center justify-center">
              <Bell size={17} className="text-[#00b894]" />
            </div>
            <div>
              <p className="text-[#00b894] text-[10px] font-semibold uppercase tracking-widest">App móvil</p>
              <h2 className="text-[#f0f5f3] font-bold text-base leading-tight">Avísame cuando esté</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-[#5a9070] hover:text-[#f0f5f3] transition-colors mt-0.5 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          {!done ? (
            <>
              <p className="text-sm text-[#6a8880] mb-5 leading-relaxed">
                Las apps para iOS y Android están en camino. Dejanos tu correo y te avisamos el día del lanzamiento — antes que nadie.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  label="Tu nombre"
                  type="text" required placeholder="ej. Carlos Rodríguez"
                  value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
                />
                <Field
                  label="Tu correo electrónico"
                  type="email" required placeholder="ej. carlos@correo.com"
                  value={lead.email} onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
                />
                {error && <p className="text-[#e53e3e] text-xs">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-[#00b894] hover:bg-[#00a07e] disabled:opacity-60 text-[#001e18] font-bold rounded-lg transition-colors text-sm">
                  {submitting ? 'Enviando…' : 'Avisame cuando esté lista'}
                </button>
                <p className="text-[10px] text-[#bbb] text-center leading-relaxed">Sin spam. Solo te avisamos cuando lancemos.</p>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-[#00b894] mx-auto mb-4" />
              <h3 className="font-bold text-[#111816] text-lg mb-2">¡Listo, {lead.name.split(' ')[0]}!</h3>
              <p className="text-sm text-[#6a8880] leading-relaxed mb-4">
                Te vamos a avisar a <strong className="text-[#111816]">{lead.email}</strong> el día que lancemos la app.
              </p>
              <button onClick={onClose}
                className="px-6 py-2.5 border border-[#d0e0da] text-[#111816] font-semibold text-sm rounded-lg hover:bg-[#f0f5f3] transition-colors">
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
