import { useState, useMemo, useEffect } from 'react';
import { X, Ship, ArrowRight, ArrowLeft, MessageSquare, Search, Loader2, AlertCircle } from 'lucide-react';
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

  // Filter boats by search
  const filteredEmbarcaciones = useMemo(() => {
    const boats = getEmbarcaciones.data || [];
    if (!searchTerm) return boats.slice(0, 10);
    return boats.filter(b => 
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [getEmbarcaciones.data, searchTerm]);

  const selectedBoat = getEmbarcaciones.data?.find(b => b.id === selectedId);

  // Auto-select and lock type based on boat status
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
      // Reset and close
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/60 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <Ship className="w-6 h-6 text-amber-500" />
              Registrar Movimiento
            </h3>
            <p className="text-slate-400 text-sm mt-1">Registra una entrada o salida manual de embarcación.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          
          {/* Step 1: Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">1. Seleccionar Embarcación</label>
            
            {!selectedId ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o matrícula..."
                    className="w-full pl-12 pr-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-amber-500 text-white transition-all font-bold placeholder-slate-600"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {getEmbarcaciones.isLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-600" /></div>
                  ) : filteredEmbarcaciones.map(boat => (
                    <button
                      key={boat.id}
                      type="button"
                      onClick={() => setSelectedId(boat.id)}
                      className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors">
                          <Ship className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-white group-hover:text-amber-400">{boat.nombre}</p>
                          <p className="text-xs text-slate-500 font-mono tracking-tighter">{boat.matricula}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-900 text-slate-500">
                        {boat.estado}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                    <Ship className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{selectedBoat?.nombre}</p>
                    <p className="text-sm text-amber-400 font-bold opacity-70">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-xs font-bold text-amber-500 hover:text-white uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-lg hover:bg-amber-500 transition-all"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 2: Type */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">2. Tipo de Movimiento</label>
                {selectedBoat && (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Requerido por estado: {selectedBoat.estado}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={selectedBoat?.estado === 'EN_CUNA'}
                  onClick={() => setTipo('entrada')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    tipo === 'entrada' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  } ${selectedBoat?.estado === 'EN_CUNA' ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  <ArrowRight className="w-6 h-6 mb-2" />
                  <span className="font-bold">Entrada</span>
                  <span className="text-[10px] opacity-60 uppercase font-black">A Cuna</span>
                </button>
                <button
                  type="button"
                  disabled={selectedBoat && selectedBoat.estado !== 'EN_CUNA'}
                  onClick={() => setTipo('salida')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    tipo === 'salida' 
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  } ${selectedBoat && selectedBoat.estado !== 'EN_CUNA' ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  <ArrowLeft className="w-6 h-6 mb-2" />
                  <span className="font-bold">Salida</span>
                  <span className="text-[10px] opacity-60 uppercase font-black">Al Agua</span>
                </button>
              </div>
            </div>

            {/* Step 3: Obs */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">3. Observaciones</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                <textarea 
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Opcional..."
                  className="w-full pl-12 pr-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-amber-500 text-white transition-all font-medium placeholder-slate-700 resize-none"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-800/60 bg-slate-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-400 hover:text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedId}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Registro'}
          </button>
        </div>
      </div>
    </div>
  );
}
