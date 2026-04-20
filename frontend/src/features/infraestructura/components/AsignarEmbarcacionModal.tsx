import { useState } from 'react';
import { Anchor, X, MapPin, Loader2 } from 'lucide-react';
import { Embarcacion } from '../../embarcaciones/hooks/useEmbarcaciones';

interface AsignarEmbarcacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  espacioId: number;
  codigoEspacio: string;
  embarcacionesLibres: Embarcacion[];
  onAsignar: (embarcacionId: number) => Promise<void>;
}

export function AsignarEmbarcacionModal({
  isOpen,
  onClose,
  codigoEspacio,
  embarcacionesLibres,
  onAsignar
}: AsignarEmbarcacionModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    await onAsignar(selectedId);
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
              <Anchor className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Asignación: {codigoEspacio}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Infraestructura y muellaje</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {embarcacionesLibres.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-[2rem] border border-dashed border-[var(--border-primary)]">
              <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest">Sin flota disponible</p>
              <p className="text-slate-600 text-[10px] mt-2 uppercase px-6">No hay embarcaciones "a flote" o sin ubicación registrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {embarcacionesLibres.map(emb => (
                <button
                  key={emb.id}
                  onClick={() => setSelectedId(emb.id)}
                  className={`text-left px-6 py-5 rounded-2xl border transition-all ${selectedId === emb.id
                    ? 'bg-indigo-600 border-indigo-500 text-[var(--text-primary)] shadow-2xl shadow-indigo-600/40 translate-x-1'
                    : 'bg-slate-900/40 border-[var(--border-primary)] text-slate-400 hover:border-indigo-500/50 hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-black text-sm uppercase tracking-tight">{emb.nombre}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedId === emb.id ? 'bg-indigo-400/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {emb.matricula}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${selectedId === emb.id ? 'text-indigo-100' : 'text-slate-600'}`}>
                    {emb.cliente?.nombre || 'Propietario no asignado'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-10 pb-10 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-slate-800 hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || isLoading}
            className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-[0_12px_40px_-12px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <><Anchor className="w-4 h-4" /> Confirmar Asignación</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
