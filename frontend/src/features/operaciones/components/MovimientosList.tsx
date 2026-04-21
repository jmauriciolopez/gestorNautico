import { useState } from 'react';
import { Ship, MapPin, Loader2, Plus, Calendar, ArrowRight, ArrowLeft, History, FileText, Trash2 } from 'lucide-react';
import { Movimiento, useOperaciones } from '../hooks/useOperaciones';
import { NuevoMovimientoModal } from './NuevoMovimientoModal';
import { ActionMenu } from '../../../shared/components/ActionMenu';
import { useConfirm } from '../../../shared/context/ConfirmContext';

interface MovimientosListProps {
  movimientos: Movimiento[];
  isLoading: boolean;
}

export function MovimientosList({ movimientos, isLoading }: MovimientosListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { createMovimiento } = useOperaciones();
  const confirm = useConfirm();

  const handleDelete = async (mov: Movimiento) => {
    const confirmed = await confirm({
      title: 'Eliminar Movimiento',
      message: `¿Eliminar el movimiento de "${mov.embarcacion?.nombre}" del ${new Date(mov.fecha).toLocaleDateString('es-AR')}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        await fetch(`${baseUrl}/movimientos/${mov.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

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
          <div key={mov.id} className="group relative bg-[var(--bg-secondary)]/20 hover:bg-[var(--bg-secondary)]/40 rounded-[2.5rem] border border-[var(--border-primary)]/40 hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${mov.tipo === 'entrada' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 pl-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${mov.tipo === 'entrada'
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
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
                        <span className="text-amber-500">{mov.espacio.rack?.codigo || 'R'}-{mov.espacio.numero}</span>
                      ) : (
                        <span className="text-emerald-500">Sector Agua</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                {mov.observaciones && (
                  <button
                    onClick={() => setExpandedId(expandedId === mov.id ? null : mov.id)}
                    className="flex items-center gap-2 px-4 py-2 text-[9px] font-black text-[var(--text-muted)] hover:text-amber-500 uppercase tracking-widest bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Notas
                  </button>
                )}
                <ActionMenu
                  items={[
                    {
                      label: mov.observaciones ? 'Ver / Ocultar Notas' : 'Sin notas',
                      icon: FileText,
                      onClick: () => setExpandedId(expandedId === mov.id ? null : mov.id),
                    },
                    {
                      label: 'Eliminar Registro',
                      icon: Trash2,
                      variant: 'danger' as const,
                      onClick: () => handleDelete(mov),
                    },
                  ]}
                />
              </div>
            </div>

            {/* Notas expandibles */}
            {expandedId === mov.id && mov.observaciones && (
              <div className="px-8 pb-6 border-t border-[var(--border-secondary)] ml-6">
                <div className="bg-[var(--bg-secondary)]/40 border border-[var(--border-secondary)] rounded-2xl px-5 py-4 mt-4">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Anotaciones de Bitácora</p>
                  <p className="text-sm text-[var(--text-secondary)] font-medium italic leading-relaxed">{mov.observaciones}</p>
                </div>
              </div>
            )}
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
