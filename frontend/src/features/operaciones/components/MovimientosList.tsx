import { useState } from 'react';
import { Ship, MapPin, Loader2, Plus, Calendar, ArrowRightLeft } from 'lucide-react';
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
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-primary)]/60 pb-6 mb-6">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Registro de Movimientos</h3>
          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Trazabilidad física de embarcaciones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-[var(--text-primary)] font-black rounded-xl transition-all shadow-lg shadow-amber-900/40 active:scale-95 text-[10px] uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Registrar Operación
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Embarcación</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Tipo de Maniobra</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Ubicación Actual</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {movimientos.map((mov) => (
              <tr key={mov.id} className="group hover:bg-slate-800/30 transition-all cursor-default text-sm">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Ship className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors uppercase tracking-tight">{mov.embarcacion?.nombre}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${mov.tipo.toLowerCase() === 'entrada'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    <ArrowRightLeft className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{mov.tipo}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    {mov.espacio ? (
                      <span className="text-[12px] font-black text-[var(--text-primary)] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {mov.espacio.rack?.codigo ? `${mov.espacio.rack.codigo}` : ''}-{mov.espacio.numero}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                        Sector Agua / Flote
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 text-right text-[var(--text-secondary)] font-black text-[11px] uppercase tracking-tighter tabular-nums">
                  {new Date(mov.fecha).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-24 text-center">
                  <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-slate-700">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">No se detectaron movimientos en el período actual.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
