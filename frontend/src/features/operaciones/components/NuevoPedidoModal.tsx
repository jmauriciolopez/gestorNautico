import { useState, useMemo } from 'react';
import { X, Anchor, Search, Ship, Calendar, Clock, Loader2, ArrowRight } from 'lucide-react';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';

interface NuevoPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { embarcacionId: number; fechaProgramada: string }) => Promise<void>;
}

export function NuevoPedidoModal({ isOpen, onClose, onSave }: NuevoPedidoModalProps) {
  const { getEmbarcaciones } = useEmbarcaciones();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoatId, setSelectedBoatId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmbarcaciones = useMemo(() => {
    const boats = getEmbarcaciones.data || [];
    if (!searchTerm) return boats.slice(0, 5);
    return boats.filter(b =>
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [getEmbarcaciones.data, searchTerm]);

  const selectedBoat = getEmbarcaciones.data?.find(b => b.id === selectedBoatId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoatId) return;

    setIsSubmitting(true);
    try {
      const fechaProgramada = `${fecha}T${hora}:00.000Z`;
      await onSave({
        embarcacionId: selectedBoatId,
        fechaProgramada,
      });
      onClose();
    } catch (error) {
      console.error('Error creating pedal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-[var(--border-primary)]/60 w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Anchor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Nueva Operación</h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Programar movimiento de flota</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Ship className="w-3.5 h-3.5" /> 1. Localizar Embarcación
            </label>

            {!selectedBoatId ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    autoFocus
                    className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl pl-11 pr-5 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Matrícula o Nombre..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {getEmbarcaciones.isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-700" /></div>
                  ) : (
                    filteredEmbarcaciones.map(boat => (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedBoatId(boat.id)}
                        className="flex items-center justify-between p-4 bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)]/40 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <Ship className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors uppercase">{boat.nombre}</p>
                            <p className="text-[10px] text-slate-600 font-black tracking-widest mt-0.5">{boat.matricula}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-[var(--text-primary)] transition-all transform group-hover:translate-x-1" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)] uppercase">{selectedBoat?.nombre}</p>
                    <p className="text-[10px] text-blue-400/70 font-black tracking-widest">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBoatId(null)}
                  className="text-[9px] font-black text-blue-400 hover:text-[var(--text-primary)] uppercase tracking-widest px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> 2. Fecha
              </label>
              <input
                type="date"
                required
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors font-bold [color-scheme:dark]"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> 3. Hora
              </label>
              <input
                type="time"
                required
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors font-bold [color-scheme:dark]"
                value={hora}
                onChange={e => setHora(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-3.5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 hover:text-[var(--text-primary)] transition-all"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBoatId}
              className="flex-[2] px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[var(--text-primary)] font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[var(--text-primary)]" /> : 'Confirmar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
