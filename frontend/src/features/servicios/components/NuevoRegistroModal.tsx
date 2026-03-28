import { useState, useMemo, useEffect } from 'react';
import { X, Wrench, Search, Ship, Calendar, DollarSign, MessageSquare, Loader2 } from 'lucide-react';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { useServicios, RegistroServicio } from '../hooks/useServicios';

interface NuevoRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<RegistroServicio> & { embarcacionId: number; servicioId: number }) => Promise<void>;
  initialData?: RegistroServicio | null;
}

export function NuevoRegistroModal({ isOpen, onClose, onSave, initialData }: NuevoRegistroModalProps) {
  const { getEmbarcaciones } = useEmbarcaciones();
  const { getCatalogo } = useServicios();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoatId, setSelectedBoatId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [fechaProgramada, setFechaProgramada] = useState(new Date().toISOString().split('T')[0]);
  const [costoFinal, setCostoFinal] = useState<number>(0);
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize for editing
  useEffect(() => {
    if (initialData && isOpen) {
      setSelectedBoatId(initialData.embarcacionId);
      setSelectedServiceId(initialData.servicioId);
      setFechaProgramada(initialData.fechaProgramada);
      setCostoFinal(Number(initialData.costoFinal));
      setObservaciones(initialData.observaciones || '');
    } else if (isOpen) {
      setSelectedBoatId(null);
      setSelectedServiceId(null);
      setFechaProgramada(new Date().toISOString().split('T')[0]);
      setCostoFinal(0);
      setObservaciones('');
    }
  }, [initialData, isOpen]);

  // Update cost when service changes
  useEffect(() => {
    if (!initialData && selectedServiceId && getCatalogo.data) {
      const service = getCatalogo.data.find(s => s.id === selectedServiceId);
      if (service) {
        setCostoFinal(Number(service.precioBase));
      }
    }
  }, [selectedServiceId, getCatalogo.data, initialData]);

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
    if (!selectedBoatId || !selectedServiceId) return;

    setIsSubmitting(true);
    try {
      await onSave({
        embarcacionId: selectedBoatId,
        servicioId: selectedServiceId,
        fechaProgramada,
        costoFinal,
        observaciones,
      });
      onClose();
    } catch (error) {
      console.error('Error saving service record:', error);
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
              <Wrench className="w-6 h-6 text-emerald-500" />
              {initialData ? 'Editar Registro de Servicio' : 'Nuevo Registro de Servicio'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">Asigna un servicio del catálogo a una embarcación.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Boat Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">1. Embarcación</label>
            
            {!selectedBoatId ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-bold"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o matrícula..."
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
                        className="flex items-center gap-4 p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                      >
                        <Ship className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                        <div className="text-left">
                          <p className="font-bold text-white group-hover:text-emerald-400">{boat.nombre}</p>
                          <p className="text-xs text-slate-500 font-mono">{boat.matricula}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <Ship className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-lg font-black text-white">{selectedBoat?.nombre}</p>
                    <p className="text-sm text-emerald-400/70 font-bold">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                {!initialData && (
                  <button 
                    type="button" 
                    onClick={() => setSelectedBoatId(null)}
                    className="text-xs font-bold text-emerald-500 hover:text-white uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500 transition-all"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">2. Servicio</label>
              <select
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                value={selectedServiceId || ''}
                onChange={e => setSelectedServiceId(Number(e.target.value))}
                disabled={initialData !== null && initialData !== undefined}
              >
                <option value="" disabled>Seleccionar servicio...</option>
                {getCatalogo.data?.filter(s => s.activo).map(svc => (
                  <option key={svc.id} value={svc.id}>{svc.nombre} (${Number(svc.precioBase).toLocaleString()})</option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">3. Fecha Programada</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="date"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold"
                  value={fechaProgramada}
                  onChange={e => setFechaProgramada(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Amount & Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">4. Costo Estimado/Final</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold"
                  value={costoFinal}
                  onChange={e => setCostoFinal(Number(e.target.value))}
                />
              </div>
              <p className="text-[10px] text-slate-500 px-2 italic">Por defecto toma el precio del catálogo.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">5. Observaciones</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-600" />
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-all min-h-[100px] resize-none"
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Detalles del trabajo..."
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
              disabled={isSubmitting || !selectedBoatId || !selectedServiceId}
              className="flex-[2] px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Guardar Cambios' : 'Registrar Servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
