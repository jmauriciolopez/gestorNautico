import { useState } from 'react';
import { Anchor, Clock, CheckCircle2, XCircle, Ship } from 'lucide-react';
import type { SolicitudBajada } from '../hooks/useOperaciones';

interface Props {
  solicitudes: SolicitudBajada[];
  isLoading: boolean;
  onUpdateEstado: (id: number, estado: SolicitudBajada['estado'], motivo?: string) => void;
}

const ESTADO_CONFIG = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  COMPLETADA: { label: 'Completada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELADA:  { label: 'Cancelada',  color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export function SolicitudesBajadaList({ solicitudes, isLoading, onUpdateEstado }: Props) {
  const [cancelModal, setCancelModal] = useState<{ id: number } | null>(null);
  const [motivo, setMotivo] = useState('');

  const handleCancelar = () => {
    if (!cancelModal) return;
    onUpdateEstado(cancelModal.id, 'CANCELADA', motivo);
    setCancelModal(null);
    setMotivo('');
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Embarcación</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Fecha deseada</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Observaciones</th>
              <th className="px-6 py-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-600 font-bold">Cargando...</td></tr>
            ) : solicitudes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <Anchor className="w-8 h-8 text-[var(--text-muted)]" />
                    <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest">Sin solicitudes</p>
                  </div>
                </td>
              </tr>
            ) : (
              solicitudes.map(s => {
                const cfg = ESTADO_CONFIG[s.estado];
                const activa = s.estado === 'PENDIENTE' || s.estado === 'CONFIRMADA';
                return (
                  <tr key={s.id} className="group hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{s.cliente.nombre}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{s.cliente.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <p className="text-sm font-black text-[var(--text-primary)]">{s.embarcacion.nombre}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase">{s.embarcacion.matricula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-[var(--text-secondary)] uppercase">
                        <Clock className="w-3 h-3" />
                        {new Date(s.fechaHoraDeseada).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-[var(--text-secondary)] max-w-[160px] truncate">
                      {s.observaciones || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activa && (
                        <div className="flex items-center justify-end gap-2">
                          {s.estado === 'PENDIENTE' && (
                            <button
                              onClick={() => onUpdateEstado(s.id, 'CONFIRMADA')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Confirmar
                            </button>
                          )}
                          {s.estado === 'CONFIRMADA' && (
                            <button
                              onClick={() => onUpdateEstado(s.id, 'COMPLETADA')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Completar
                            </button>
                          )}
                          <button
                            onClick={() => { setCancelModal({ id: s.id }); setMotivo(''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-rose-400 text-[9px] font-black uppercase tracking-widest transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal cancelación con motivo */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-1">Cancelar solicitud</h3>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-5">El cliente recibirá un email con el motivo</p>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Motivo de cancelación (opcional)..."
              rows={3}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-rose-500/50 mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 py-3 rounded-2xl border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
