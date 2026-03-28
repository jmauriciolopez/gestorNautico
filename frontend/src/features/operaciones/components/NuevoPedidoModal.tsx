import { useState, useMemo } from 'react';
import { X, Anchor, Search, Ship, Calendar, Clock, Loader2 } from 'lucide-react';
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
      const fechaProgramada = `${fecha}T${hora}:00Z`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/60 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <Anchor className="w-6 h-6 text-indigo-500" />
              Nueva Solicitud de Botada/Izada
            </h3>
            <p className="text-slate-400 text-sm mt-1">Programa una maniobra para un cliente.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Boat Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">1. Embarcación del Cliente</label>
            
            {!selectedBoatId ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar embarcación..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {getEmbarcaciones.isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-700" /></div>
                  ) : (
                    filteredEmbarcaciones.map(boat => (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedBoatId(boat.id)}
                        className="flex items-center gap-4 p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                      >
                        <Ship className="w-5 h-5 text-slate-600 group-hover:text-indigo-500 transition-colors" />
                        <div className="text-left">
                          <p className="font-bold text-white group-hover:text-indigo-400">{boat.nombre}</p>
                          <p className="text-xs text-slate-500 font-mono">{boat.matricula}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <Ship className="w-8 h-8 text-indigo-500" />
                  <div>
                    <p className="text-lg font-black text-white">{selectedBoat?.nombre}</p>
                    <p className="text-sm text-indigo-400/70 font-bold">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedBoatId(null)}
                  className="text-xs font-bold text-indigo-500 hover:text-white uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-lg hover:bg-indigo-500 transition-all"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">2. Fecha de la Maniobra</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="date"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">3. Hora Estimada</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="time"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBoatId}
              className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Solicitud'}
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest font-bold">
            El cliente será notificado automáticamente de la programación.
          </p>
        </form>
      </div>
    </div>
  );
}
