import { useState } from 'react';
import { Anchor, X, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/50">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
              <Anchor className="w-5 h-5 text-blue-400" />
              Asignar Embarcación
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Seleccione la embarcación que ocupará el espacio <strong className="text-[var(--text-primary)] bg-slate-800 px-2 py-0.5 rounded px-1">{codigoEspacio}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {embarcacionesLibres.length === 0 ? (
            <div className="text-center py-10 bg-[var(--bg-primary)]/50 rounded-2xl border border-dashed border-[var(--border-primary)]">
              <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-[var(--text-secondary)] font-medium">No hay embarcaciones "a flote" o sin ubicación registrada.</p>
              <p className="text-[var(--text-secondary)] text-sm mt-1">Desea agregar una nueva embarcación desde su módulo correspondiente o liberar una de otro rack.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {embarcacionesLibres.map(emb => (
                <button
                  key={emb.id}
                  onClick={() => setSelectedId(emb.id)}
                  className={`text-left px-5 py-4 rounded-2xl border transition-all ${selectedId === emb.id
                    ? 'bg-blue-600 border-blue-500 text-[var(--text-primary)] shadow-lg shadow-blue-600/20'
                    : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-slate-300 hover:border-blue-500/50 hover:bg-[var(--bg-secondary)]'
                    }`}
                >
                  <p className="font-bold text-lg">{emb.nombre}</p>
                  <p className={`text-sm ${selectedId === emb.id ? 'text-blue-100' : 'text-[var(--text-secondary)]'}`}>
                    Mat: {emb.matricula} | {emb.cliente?.nombre || 'Propietario no asignado'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-[var(--text-secondary)] text-[var(--text-primary)] font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            {isLoading ? 'Asignando...' : 'Confirmar Asignación'}
          </button>
        </div>
      </div>
    </div>
  );
}
