import { useState, useMemo, useEffect } from 'react';
import { X, Ship, ArrowRight, ArrowLeft, MessageSquare, Search, Loader2, AlertCircle, ArrowRightLeft } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-[var(--border-primary)]/60 w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-amber-900/10 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Registro de Maniobra</h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Control de entradas y salidas de galpón</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Ship className="w-3.5 h-3.5" /> 1. Embarcación
            </label>

            {!selectedId ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Localizar por nombre o matrícula..."
                    className="w-full pl-11 pr-5 py-3 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl focus:outline-none focus:border-amber-500 text-sm text-[var(--text-primary)] transition-all font-bold uppercase"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {getEmbarcaciones.isLoading ? (
                    <div className="py-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-800" /></div>
                  ) : filteredEmbarcaciones.map(boat => (
                    <button
                      key={boat.id}
                      type="button"
                      onClick={() => setSelectedId(boat.id)}
                      className="flex items-center justify-between p-4 bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)]/40 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <Ship className="w-5 h-5 text-slate-700 group-hover:text-amber-500 transition-colors" />
                        <div className="text-left">
                          <p className="font-bold text-[var(--text-primary)] group-hover:text-amber-400 text-sm uppercase">{boat.nombre}</p>
                          <p className="text-[10px] text-slate-700 font-black tracking-widest mt-0.5">{boat.matricula}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-[var(--bg-primary)] text-slate-600 border border-slate-900">
                          {boat.estado}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-[var(--text-primary)] transition-all transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-amber-600/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center text-amber-400">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)] uppercase">{selectedBoat?.nombre}</p>
                    <p className="text-[10px] text-amber-400/70 font-black tracking-widest">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-[9px] font-black text-amber-500 hover:text-[var(--text-primary)] uppercase tracking-widest px-3 py-1.5 bg-amber-500/10 rounded-lg hover:bg-amber-600 transition-all font-black"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">2. Dirección</label>
                {selectedBoat && (
                  <span className="text-[9px] font-black text-amber-500 flex items-center gap-1.5 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 uppercase tracking-widest">
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
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 ${tipo === 'entrada'
                    ? 'bg-blue-600 border-blue-500 text-[var(--text-primary)] shadow-xl shadow-blue-900/40 translate-y-[-2px]'
                    : 'bg-[var(--bg-secondary)]/40 border-[var(--border-primary)] text-slate-600 hover:border-slate-700'
                    } ${selectedBoat?.estado === 'EN_CUNA' ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  <ArrowRight className="w-6 h-6 mb-2" />
                  <span className="text-xs font-black uppercase tracking-widest">Cuna</span>
                  <span className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">Entrada</span>
                </button>
                <button
                  type="button"
                  disabled={selectedBoat && selectedBoat.estado !== 'EN_CUNA'}
                  onClick={() => setTipo('salida')}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 ${tipo === 'salida'
                    ? 'bg-emerald-600 border-emerald-500 text-[var(--text-primary)] shadow-xl shadow-emerald-900/40 translate-y-[-2px]'
                    : 'bg-[var(--bg-secondary)]/40 border-[var(--border-primary)] text-slate-600 hover:border-slate-700'
                    } ${selectedBoat && selectedBoat.estado !== 'EN_CUNA' ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  <ArrowLeft className="w-6 h-6 mb-2" />
                  <span className="text-xs font-black uppercase tracking-widest">Agua</span>
                  <span className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">Salida</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">3. Notas de Bitácora</label>
              <textarea
                rows={4}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones de la maniobra..."
                className="w-full px-4 py-3 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:border-amber-500 text-sm text-[var(--text-primary)] transition-all font-medium placeholder-slate-700 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-3.5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 hover:text-[var(--text-primary)] transition-all"
            >
              Cerrar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedId}
              className="flex-[2] px-8 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-[var(--text-primary)] font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[var(--text-primary)]" /> : 'Finalizar Maniobra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
