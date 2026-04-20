import { useState, useMemo, useEffect } from 'react';
import { X, Ship, ArrowRight, ArrowLeft, Search, Loader2, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';

interface NuevoMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { embarcacionId: number; tipo: 'entrada' | 'salida'; observaciones?: string }) => Promise<void>;
}

export function NuevoMovimientoModal({ isOpen, onClose, onSuccess }: NuevoMovimientoModalProps) {
  const { getEmbarcaciones } = useEmbarcaciones();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmbarcaciones = useMemo(() => {
    const boats = getEmbarcaciones.data || [];
    if (!searchTerm) return boats.slice(0, 5);
    return boats.filter(b =>
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [getEmbarcaciones.data, searchTerm]);

  const selectedBoat = getEmbarcaciones.data?.find(b => b.id === selectedId);

  useEffect(() => {
    if (selectedBoat) {
      if (selectedBoat.estado === 'EN_CUNA') {
        setTipo('salida');
      } else {
        setTipo('entrada');
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
        observaciones
      });
      setSelectedId(null);
      setSearchTerm('');
      setObservaciones('');
      onClose();
    } catch (error) {
      console.error('Error recording movement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-[12px] animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] w-full max-w-2xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-[var(--accent-amber-soft)] to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
              <ArrowRightLeft className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Registro de Maniobra</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Control de entradas y salidas de galpón</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-3">
                <Ship className="w-4 h-4 text-amber-500" /> 1. Embarcación
              </label>
              {selectedId && (
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">Barco identificado</span>
              )}
            </div>

            {!selectedId ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Localizar por nombre o matrícula..."
                    className="w-full pl-14 pr-6 py-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[1.5rem] focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm text-[var(--text-primary)] transition-all font-bold uppercase placeholder:opacity-40"
                  />
                </div>

                <div className="max-h-[320px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {getEmbarcaciones.isLoading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500/40" />
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Consultando hangar...</p>
                    </div>
                  ) : filteredEmbarcaciones.length > 0 ? (
                    filteredEmbarcaciones.map(boat => (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedId(boat.id)}
                        className="w-full flex items-center justify-between p-5 bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)]/40 rounded-[1.5rem] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group/item text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] group-hover/item:text-amber-500 group-hover/item:border-amber-500/20 transition-all">
                            <Ship className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-[var(--text-primary)] group-hover/item:text-amber-400 text-sm uppercase leading-none mb-1">{boat.nombre}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black tracking-widest uppercase">{boat.matricula}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="text-right hidden sm:block">
                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Estado Actual</p>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${
                              boat.estado === 'EN_CUNA' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {boat.estado}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover/item:text-amber-500 transition-all transform group-hover/item:translate-x-1" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[2rem]">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">No se encontraron embarcaciones</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-600/10 to-transparent border border-amber-500/30 rounded-[2rem] shadow-xl shadow-amber-900/5 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                    <Ship className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">{selectedBoat?.nombre}</h4>
                    <p className="text-[10px] text-amber-500 font-black tracking-[0.3em] uppercase">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="px-6 py-2.5 bg-[var(--bg-primary)] border border-amber-500/20 text-[10px] font-black text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all uppercase tracking-widest shadow-lg"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">2. Dirección</label>
                {selectedBoat && (
                  <span className="text-[9px] font-black text-amber-500 flex items-center gap-2 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10 uppercase">
                    <AlertCircle className="w-3 h-3" />
                    En {selectedBoat.estado}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={selectedBoat?.estado === 'EN_CUNA'}
                  onClick={() => setTipo('entrada')}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-500 ${tipo === 'entrada'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-900/40 translate-y-[-4px]'
                    : 'bg-[var(--bg-secondary)]/40 border-[var(--border-primary)] text-[var(--text-muted)] hover:border-indigo-500/30'
                    } ${selectedBoat?.estado === 'EN_CUNA' ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  <ArrowRight className="w-8 h-8 mb-3" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Cuna</span>
                  <span className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">Entrada</span>
                </button>
                <button
                  type="button"
                  disabled={selectedBoat && selectedBoat.estado !== 'EN_CUNA'}
                  onClick={() => setTipo('salida')}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-500 ${tipo === 'salida'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-2xl shadow-emerald-900/40 translate-y-[-4px]'
                    : 'bg-[var(--bg-secondary)]/40 border-[var(--border-primary)] text-[var(--text-muted)] hover:border-emerald-500/30'
                    } ${selectedBoat && selectedBoat.estado !== 'EN_CUNA' ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  <ArrowLeft className="w-8 h-8 mb-3" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Agua</span>
                  <span className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">Salida</span>
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] px-2">3. Notas de Bitácora</label>
              <textarea
                rows={5}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones de la maniobra..."
                className="w-full px-5 py-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-3xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm text-[var(--text-primary)] transition-all font-medium placeholder:opacity-30 resize-none"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-10 py-5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="flex-[2] px-10 py-5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-amber-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalizar Maniobra <CheckCircle2 className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
