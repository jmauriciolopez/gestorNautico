import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight as ArrowLeftRightIcon, X, Search, Ship, ArrowRight, Loader2, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { toast } from 'react-hot-toast';
import { EstadoEmbarcacion, TipoMovimiento } from '../../../shared/types/enums';

interface NuevoMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { embarcacionId: number; tipo: TipoMovimiento; observaciones?: string }) => Promise<void>;
}

export function NuevoMovimientoModal({ isOpen, onClose, onSuccess }: NuevoMovimientoModalProps) {
  const { getEmbarcaciones } = useEmbarcaciones();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoMovimiento>(TipoMovimiento.ENTRADA);
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmbarcaciones = useMemo(() => {
    const boats = getEmbarcaciones.data?.data || [];
    if (!searchTerm) return boats.slice(0, 5);
    return boats.filter(b =>
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [getEmbarcaciones.data, searchTerm]);

  const selectedBoat = getEmbarcaciones.data?.data?.find(b => b.id === selectedId);

  useEffect(() => {
    if (selectedBoat) {
      if (selectedBoat.estado_operativo === EstadoEmbarcacion.EN_CUNA) {
        setTipo(TipoMovimiento.SALIDA);
      } else {
        setTipo(TipoMovimiento.ENTRADA);
      }
    }
  }, [selectedBoat]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setIsSubmitting(true);
    try {
      await onSuccess({
        embarcacionId: selectedId,
        tipo,
        observaciones,
      });
      setSelectedId(null);
      setSearchTerm('');
      setObservaciones('');
      onClose();
    } catch (error: any) {
      const msg = error?.message || 'Error al registrar la maniobra. Intente nuevamente.';
      toast.error(msg);
      console.error('Error recording movement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md"
        onClick={onClose}
      />
      <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative z-10">

        {/* Header */}
        <div className="px-12 pt-12 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 shadow-inner">
              <ArrowLeftRightIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Nueva Maniobra
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1.5 opacity-60">Logística y movimientos internos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-strong)]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-12">
          {/* 1. Selección de Embarcación */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-3">
                <Ship className="w-4 h-4 text-indigo-500" /> 1. Selección de Unidad
              </label>
              {selectedId && (
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">Identificada</span>
              )}
            </div>

            {!selectedId ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR POR NOMBRE O MATRÍCULA..."
                    className="w-full pl-16 pr-6 py-5 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[1.75rem] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-[var(--text-primary)] transition-all font-black uppercase placeholder:opacity-40"
                  />
                </div>

                <div className="max-h-[280px] overflow-y-auto pr-3 space-y-3 custom-scrollbar">
                  {getEmbarcaciones.isLoading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500/40" />
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Consultando hangar...</p>
                    </div>
                  ) : filteredEmbarcaciones.length > 0 ? (
                    filteredEmbarcaciones.map(boat => (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedId(boat.id)}
                        className="w-full flex items-center justify-between p-5 bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)]/40 rounded-[1.75rem] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group/item text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] group-hover/item:text-indigo-500 group-hover/item:border-indigo-500/20 transition-all shadow-inner">
                            <Ship className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-[var(--text-primary)] group-hover/item:text-indigo-400 text-sm uppercase leading-none mb-1">{boat.nombre}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black tracking-widest uppercase">{boat.matricula}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover/item:text-indigo-500 transition-all transform group-hover/item:translate-x-1" />
                      </button>
                    ))
                  ) : (
                    <div className="py-16 text-center border-2 border-dashed border-[var(--border-primary)]/40 rounded-[2.5rem]">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sin resultados coincidentes</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-7 bg-gradient-to-r from-indigo-600/10 to-transparent border border-indigo-500/30 rounded-[2.5rem] shadow-xl shadow-indigo-900/5">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-[1.25rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                    <Ship className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">{selectedBoat?.nombre}</h4>
                    <p className="text-[11px] text-indigo-500 font-black tracking-[0.3em] uppercase">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="px-6 py-3 bg-[var(--bg-primary)] border border-indigo-500/20 text-[10px] font-black text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-2xl transition-all uppercase tracking-widest shadow-lg active:scale-95"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* 2. Tipo de Maniobra */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">2. Tipo de Maniobra</label>
              {selectedBoat && (
                <span className="text-[9px] font-black text-indigo-500 flex items-center gap-2 bg-indigo-500/5 px-3 py-1.5 rounded-full border border-indigo-500/10 uppercase">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Ubicación: {selectedBoat.estado_operativo}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                disabled={selectedBoat?.estado_operativo === EstadoEmbarcacion.EN_CUNA}
                onClick={() => setTipo(TipoMovimiento.ENTRADA)}
                className={`group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border transition-all duration-500 ${tipo === TipoMovimiento.ENTRADA
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] translate-y-[-4px]'
                  : 'bg-[var(--bg-secondary)]/40 border-[var(--border-primary)] text-[var(--text-muted)] hover:border-indigo-500/40 hover:bg-indigo-500/5'
                } ${selectedBoat?.estado_operativo === EstadoEmbarcacion.EN_CUNA ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${tipo === TipoMovimiento.ENTRADA ? 'bg-white/20 text-white' : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] group-hover:border-indigo-500/30'}`}>
                  <ArrowRight className="w-7 h-7" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] mb-1">A Cuna</span>
                <span className={`text-[9px] uppercase font-black tracking-widest ${tipo === TipoMovimiento.ENTRADA ? 'text-white/60' : 'text-[var(--text-muted)] opacity-60'}`}>Entrada Marítima</span>
              </button>

              <button
                type="button"
                disabled={selectedBoat != null && selectedBoat.estado_operativo !== EstadoEmbarcacion.EN_CUNA}
                onClick={() => setTipo(TipoMovimiento.SALIDA)}
                className={`group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border transition-all duration-500 ${tipo === TipoMovimiento.SALIDA
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.5)] translate-y-[-4px]'
                  : 'bg-[var(--bg-secondary)]/40 border-[var(--border-primary)] text-[var(--text-muted)] hover:border-emerald-500/40 hover:bg-emerald-500/5'
                } ${selectedBoat != null && selectedBoat.estado_operativo !== EstadoEmbarcacion.EN_CUNA ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${tipo === TipoMovimiento.SALIDA ? 'bg-white/20 text-white' : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] group-hover:border-emerald-500/30'}`}>
                  <ArrowLeft className="w-7 h-7" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] mb-1">A Agua</span>
                <span className={`text-[9px] uppercase font-black tracking-widest ${tipo === TipoMovimiento.SALIDA ? 'text-white/60' : 'text-[var(--text-muted)] opacity-60'}`}>Salida a Canal</span>
              </button>
            </div>
          </div>

          {/* 3. Notas */}
          <div className="space-y-6">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] px-2">3. Notas de Navegación</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Anotaciones para la bitácora..."
              className="w-full px-6 py-5 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[2rem] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-[var(--text-primary)] transition-all font-medium placeholder:opacity-30 resize-none shadow-inner"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1 active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="flex-[2] px-8 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
            >
              {isSubmitting
                ? <Loader2 className="w-5 h-5 animate-spin text-white" />
                : <><Check className="w-5 h-5" /> Registrar Maniobra</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
