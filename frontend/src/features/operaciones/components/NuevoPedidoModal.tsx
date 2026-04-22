import { useState, useMemo } from 'react';
import { ClipboardCheck, X, Search, Ship, ArrowRight, Calendar, Clock, Loader2, Check, AlertTriangle } from 'lucide-react';
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
    const boats = getEmbarcaciones.data?.data || [];
    if (!searchTerm) return boats.slice(0, 5);
    return boats.filter(b =>
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [getEmbarcaciones.data, searchTerm]);

  const selectedBoat = getEmbarcaciones.data?.data?.find(b => b.id === selectedBoatId);

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
      console.error('Error creating pedido:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] w-full max-w-md rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 shadow-inner">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Orden de Trabajo
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Gestión de servicios y taller</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-3">
                <Ship className="w-4 h-4 text-indigo-500" /> 1. Localizar Embarcación
              </label>
              {selectedBoatId && (
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10 animate-in fade-in zoom-in-95">Identificada</span>
              )}
            </div>

            {!selectedBoatId ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    autoFocus
                    className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[1.5rem] pl-14 pr-6 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase font-bold placeholder:opacity-30"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Matrícula o Nombre..."
                  />
                </div>
                
                <div className="max-h-[280px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {getEmbarcaciones.isLoading ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-500/40" />
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Consultando flota...</p>
                    </div>
                  ) : filteredEmbarcaciones.length > 0 ? (
                    filteredEmbarcaciones.map(boat => (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedBoatId(boat.id)}
                        className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)]/40 rounded-[1.25rem] hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group/item"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] group-hover/item:text-indigo-500 group-hover/item:border-indigo-500/20 transition-all">
                            <Ship className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--text-primary)] group-hover/item:text-indigo-400 transition-colors uppercase leading-none mb-1">{boat.nombre}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black tracking-widest uppercase">{boat.matricula}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover/item:text-indigo-500 transition-all transform group-hover/item:translate-x-1" />
                      </button>
                    ))
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[2rem] opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-widest">Sin coincidencias</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/30 rounded-[2rem] shadow-xl shadow-indigo-900/5 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                      <Ship className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">{selectedBoat?.nombre}</h4>
                      <p className="text-[10px] text-indigo-500 font-black tracking-[0.3em] uppercase">{selectedBoat?.matricula}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBoatId(null)}
                    className="px-6 py-2.5 bg-[var(--bg-primary)] border border-indigo-500/20 text-[10px] font-black text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all uppercase tracking-widest"
                  >
                    Cambiar
                  </button>
                </div>

                {selectedBoat?.tieneDeuda && (
                  <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Atención: Deuda Pendiente</p>
                      <p className="text-[10px] text-red-400 font-bold uppercase leading-tight">El propietario registra saldos impagos. Verificar estado contable.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> 2. Fecha
              </label>
              <input
                type="date"
                required
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[1.25rem] px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                <Clock className="w-4 h-4 text-indigo-500" /> 3. Hora
              </label>
              <input
                type="time"
                required
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[1.25rem] px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                value={hora}
                onChange={e => setHora(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-[0_12px_40px_-12px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Check className="w-4 h-4" /> Emitir Pedido</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
