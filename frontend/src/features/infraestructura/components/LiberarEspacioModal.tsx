import { useState } from 'react';
import { Ship, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Embarcacion } from '../../embarcaciones/hooks/useEmbarcaciones';

interface LiberarEspacioModalProps {
  isOpen: boolean;
  onClose: () => void;
  espacioId: number;
  codigoEspacio: string;
  embarcacionEnElLugar?: Embarcacion;
  onLiberar: (embarcacionId: number | null, nuevoEstado: string) => Promise<void>;
}

export function LiberarEspacioModal({
  isOpen,
  onClose,
  codigoEspacio,
  embarcacionEnElLugar,
  onLiberar
}: LiberarEspacioModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState<string>('EN_AGUA');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onLiberar(embarcacionEnElLugar ? embarcacionEnElLugar.id : null, nuevoEstado);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] w-full max-w-md rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 shadow-inner">
              <Ship className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Liberar: {codigoEspacio}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Infraestructura y muellaje</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {embarcacionEnElLugar ? (
            <div className="bg-slate-900/40 border border-[var(--border-primary)] p-6 rounded-[2rem] flex items-center gap-5 shadow-inner">
              <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-indigo-500">
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">ID</span>
                <span className="text-xs font-black">{embarcacionEnElLugar.id}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">{embarcacionEnElLugar.nombre}</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Propietario: {embarcacionEnElLugar.cliente?.nombre || 'Desconocido'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl flex gap-4 text-amber-500/80">
              <AlertTriangle className="shrink-0 w-6 h-6" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Inconsistencia Detectada</p>
                <p className="text-[10px] uppercase font-bold leading-relaxed opacity-70">El espacio figura ocupado sin embarcación asignada. Se forzará la liberación del nodo físico.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Destino Operativo</label>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">Requerido</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'EN_CUNA', label: 'En Cuna' },
                { value: 'EN_AGUA', label: 'Puesta a Flote' },
                { value: 'MANTENIMIENTO', label: 'Varadero' },
                { value: 'INACTIVA', label: 'Exterior' }
              ]
                .filter(estado => estado.value !== embarcacionEnElLugar?.estado)
                .map((estado) => (
                  <button
                    key={estado.value}
                    type="button"
                    onClick={() => setNuevoEstado(estado.value)}
                    className={`px-5 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all text-center ${nuevoEstado === estado.value
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40 translate-y-[-2px]'
                      : 'bg-slate-900/40 border-[var(--border-primary)] text-slate-500 hover:border-indigo-500/30 hover:text-slate-300'
                      }`}
                  >
                    {estado.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="px-10 pb-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-slate-800 hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading || !nuevoEstado}
            className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-[0_12px_40px_-12px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Ship className="w-4 h-4" />
                Confirmar Liberación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
