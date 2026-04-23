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
  EN_AGUA:    { label: 'En Agua',    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  FINALIZADA: { label: 'Finalizada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
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
    <div className="p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-primary)]/40 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Solicitudes Web</h3>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-60">Gestión de lanzamientos solicitados por clientes vía App/Web</p>
        </div>
        <div className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.25rem] backdrop-blur-md">
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">{solicitudes.length} REGISTROS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
             <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sincronizando portal...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="py-32 text-center bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-primary)]/40">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-8 text-[var(--text-muted)] shadow-inner">
              <Anchor className="w-12 h-12 opacity-20" />
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-xl uppercase tracking-tight">Portal Vacío</h4>
            <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.25em] mt-3 opacity-60">No se han recibido nuevas solicitudes externas.</p>
          </div>
        ) : (
          solicitudes
            .filter(s => s.estado === 'PENDIENTE' || s.estado === 'EN_AGUA')
            .map(s => {
              const cfg = ESTADO_CONFIG[s.estado as keyof typeof ESTADO_CONFIG];
            const activa = s.estado === 'PENDIENTE' || s.estado === 'EN_AGUA';
            return (
              <div key={s.id} className="group relative bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-secondary)]/50 p-8 rounded-[2.5rem] border border-[var(--border-primary)]/60 hover:border-indigo-500/40 transition-all duration-500 flex flex-col xl:flex-row xl:items-center justify-between gap-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10">
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10 w-full xl:w-auto">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-500 ${cfg.color} shadow-lg`}>
                    <Ship className="w-8 h-8" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                        {s.embarcacion.nombre}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-full border border-[var(--border-primary)] tracking-[0.2em] uppercase">
                          {s.embarcacion.matricula}
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2.5 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40">
                         <span className="text-indigo-500">CLIENTE:</span> {s.cliente.nombre}
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {new Date(s.fechaHoraDeseada).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {s.motivoCancelacion && s.estado === 'CANCELADA' && (
                        <div className="flex items-center gap-2.5 text-[10px] text-rose-400 font-bold italic truncate max-w-[250px] bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10">
                          Motivo: "{s.motivoCancelacion}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-primary)]/50 p-3 rounded-[2rem] border border-[var(--border-primary)]/60 relative z-10 backdrop-blur-sm self-end xl:self-center">
                  {activa && (
                    <>
                      {s.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => onUpdateEstado(s.id, 'EN_AGUA')}
                          className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-indigo-900/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Bajar a Agua
                        </button>
                      )}
                      {s.estado === 'EN_AGUA' && (
                        <button
                          onClick={() => onUpdateEstado(s.id, 'FINALIZADA')}
                          className="flex items-center gap-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-emerald-900/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Vuelta a Cuna
                        </button>
                      )}
                      <div className="w-[1px] h-8 bg-[var(--border-primary)] mx-2" />
                      <button
                        onClick={() => { setCancelModal({ id: s.id }); setMotivo(''); }}
                        className="flex items-center gap-3 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Premium Cancellation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-[12px] animate-in fade-in duration-300">
          <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] rounded-[3rem] p-10 w-full max-w-md shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] transform animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                 <XCircle className="w-6 h-6" />
               </div>
               <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Cancelar solicitud</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-1 opacity-60">Se notificará al cliente por email</p>
               </div>
            </div>

            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Indique el motivo técnico o administrativo de la cancelación..."
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[1.5rem] px-5 py-4 text-sm text-[var(--text-primary)] placeholder:opacity-30 resize-none focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium mb-8"
              rows={4}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 py-4 rounded-2xl border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all"
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                className="flex-[1.5] py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-rose-900/40"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
