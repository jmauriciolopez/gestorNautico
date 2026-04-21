import { useState, useMemo, useEffect } from 'react';
import { X, Wrench, Search, Ship, Calendar, DollarSign, MessageSquare, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] backdrop-blur-md border border-[var(--border-strong)] w-full max-w-2xl rounded-[3rem] shadow-2xl shadow-indigo-900/10 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-10 pt-10 pb-6 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                {initialData ? 'Entrada Técnica' : 'Nueva Orden Servicio'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.25em] mt-1 opacity-70">Asignación de Trabajos en Taller</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-[var(--text-secondary)] hover:text-white transition-all border border-transparent hover:border-white/10 active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Boat Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">1. Unidad / Embarcación</label>

            {!selectedBoatId ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl pl-12 pr-5 py-3.5 text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all font-bold uppercase text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Filtrar por nombre o matrícula..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {getEmbarcaciones.isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                  ) : (
                    filteredEmbarcaciones.map(boat => (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedBoatId(boat.id)}
                        className="flex items-center justify-between p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)]/60 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors">
                            <Ship className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-black text-[var(--text-primary)] group-hover:text-indigo-400 uppercase tracking-tight text-xs">{boat.nombre}</p>
                            <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{boat.matricula}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-800 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] relative overflow-hidden group/boat shadow-xl shadow-indigo-900/10">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/boat:scale-110 transition-transform duration-700">
                  <Ship className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-[var(--text-primary)] shadow-lg shadow-indigo-600/20">
                    <Ship className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Unidad Seleccionada</h4>
                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">{selectedBoat?.nombre}</p>
                    <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-widest">{selectedBoat?.matricula}</p>
                  </div>
                </div>
                {!initialData && (
                  <button
                    type="button"
                    onClick={() => setSelectedBoatId(null)}
                    className="relative z-10 px-5 py-2.5 bg-[var(--bg-secondary)]/60 hover:bg-slate-800 text-xs font-black text-indigo-400 uppercase tracking-widest rounded-xl transition-all active:scale-95 border border-indigo-500/10"
                  >
                    Liberar
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">2. Catálogo / Tarea</label>
              <select
                required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer uppercase text-xs"
                value={selectedServiceId || ''}
                onChange={e => setSelectedServiceId(Number(e.target.value))}
                disabled={initialData !== null && initialData !== undefined}
              >
                <option value="" disabled>Seleccionar concepto...</option>
                {getCatalogo.data?.filter(s => s.activo).map(svc => (
                  <option key={svc.id} value={svc.id}>{svc.nombre} - ${Number(svc.precioBase).toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">3. Fecha Estimada</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="date"
                  required
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl pl-12 pr-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black text-sm [color-scheme:dark]"
                  value={fechaProgramada}
                  onChange={e => setFechaProgramada(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">4. Monto Final</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl pl-12 pr-5 py-3.5 text-lg text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black tabular-nums"
                  value={costoFinal}
                  onChange={e => setCostoFinal(Number(e.target.value))}
                />
              </div>
              <p className="text-[8px] text-slate-600 px-2 italic font-black uppercase tracking-widest">Base de contrato según catálogo.</p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">5. Notas de Taller</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-700" />
                <textarea
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl pl-12 pr-5 py-3.5 text-[13px] text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all min-h-[100px] resize-none pb-4 font-bold"
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre el requerimiento técnico o estado de la unidad..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5 active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBoatId || !selectedServiceId}
              className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black rounded-2xl text-xs uppercase tracking-[0.25em] shadow-xl shadow-indigo-900/40 active:scale-95 flex items-center justify-center gap-3 transition-all group/btn"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{initialData ? 'Actualizar Orden' : 'Cerar Orden'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
