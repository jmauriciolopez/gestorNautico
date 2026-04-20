import { useState } from 'react';
import { Ship, MapPin, Loader2, Plus, Calendar, ArrowRight, ArrowLeft, History, FileText, Monitor } from 'lucide-react';
import { Movimiento, useOperaciones } from '../hooks/useOperaciones';
import { NuevoMovimientoModal } from './NuevoMovimientoModal';

interface MovimientosListProps {
  movimientos: Movimiento[];
  isLoading: boolean;
}

export function MovimientosList({ movimientos, isLoading }: MovimientosListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createMovimiento } = useOperaciones();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)]/20">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">Auditando Bitácora Histórica...</p>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-primary)]/40 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Bitácora de Maniobras</h3>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] opacity-60">Registro histórico de movimientos de flota</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-[1.25rem] backdrop-blur-md mr-4">
            <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em]">{movimientos.length} REGISTROS</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-900/40 active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Registrar Operación Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {movimientos.map((mov) => (
          <div key={mov.id} className="group relative bg-[var(--bg-secondary)]/20 hover:bg-[var(--bg-secondary)]/40 p-6 rounded-[2.5rem] border border-[var(--border-primary)]/40 hover:border-amber-500/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${mov.tipo === 'entrada' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />

            <div className="flex items-center gap-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${mov.tipo === 'entrada'
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
                }`}>
                {mov.tipo === 'entrada' ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-lg font-black text-[var(--text-primary)] group-hover:text-amber-500 transition-colors uppercase tracking-tight">
                    {mov.embarcacion?.nombre}
                  </span>
                  <span className="text-[9px] font-black px-2.5 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-primary)] tracking-[0.2em] uppercase">
                    {mov.embarcacion?.matricula}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {new Date(mov.fecha).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-[var(--border-primary)]/40 bg-[var(--bg-primary)]/40">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {mov.espacio ? (
                      <span className="text-amber-500">
                        {mov.espacio.rack?.codigo || 'R'}-{mov.espacio.numero}
                      </span>
                    ) : (
                      <span className="text-emerald-500">Sector Agua</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 self-end md:self-center relative z-10">
              <div className="text-right max-w-[300px] hidden lg:block">
                <div className="flex items-center justify-end gap-2 mb-1.5 opacity-60">
                  <FileText className="w-3 h-3 text-amber-500" />
                  <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Anotaciones de Bitácora</p>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium line-clamp-2 italic leading-relaxed">
                  {mov.observaciones || 'Trazabilidad sin observaciones específicas'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all shadow-inner">
                <Monitor className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}

        {movimientos.length === 0 && (
          <div className="py-32 text-center bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-primary)]/40">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-8 text-[var(--text-muted)] shadow-inner">
              <History className="w-12 h-12 opacity-20" />
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-xl uppercase tracking-tight">Sin Actividad</h4>
            <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.25em] mt-3 opacity-60">La bitácora de movimientos se encuentra vacía.</p>
          </div>
        )}
      </div>

      <NuevoMovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (data) => {
          await createMovimiento.mutateAsync(data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
