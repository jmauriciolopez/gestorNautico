import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, X, Save, Plus, Loader2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface FacturaEditModalProps {
  factura: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const FacturaEditModal: React.FC<FacturaEditModalProps> = ({ factura, onClose, onSuccess }) => {
  const [fecha, setFecha] = useState(new Date(factura.fechaEmision).toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState(factura.observaciones || '');
  const [pendingCargos, setPendingCargos] = useState<any[]>([]);
  const [isLoadingCargos, setIsLoadingCargos] = useState(true);
  
  // Estado para nuevos cargos creados al vuelo
  const [nuevosCargos, setNuevosCargos] = useState<{ descripcion: string; monto: number; tipo: string }[]>([]);
  const [newItem, setNewItem] = useState({ descripcion: '', monto: '', tipo: 'OTROS' });

  useEffect(() => {
    fetchPendingCargos();
  }, []);

  const fetchPendingCargos = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/cargos?clienteId=${factura.cliente.id}&soloSinFacturar=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Flatten pagination if needed
        setPendingCargos(data.items || data || []);
      }
    } catch (error) {
      console.error('Error fetching pending cargos:', error);
    } finally {
      setIsLoadingCargos(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${baseUrl}/facturas/${factura.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fechaEmision: fecha,
          observaciones,
          cargoIds: [...(factura.cargos?.map((c: any) => c.id) || []), ...selectedCargoIds],
          nuevosCargos: nuevosCargos.map(nc => ({ ...nc, monto: Number(nc.monto) }))
        })
      });

      if (!response.ok) throw new Error('Error al actualizar factura');

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewItemRow = () => {
    if (!newItem.descripcion || !newItem.monto) return;
    setNuevosCargos(prev => [...prev, { ...newItem, monto: Number(newItem.monto) }]);
    setNewItem({ descripcion: '', monto: '', tipo: 'OTROS' });
  };

  const removeNewItem = (index: number) => {
    setNuevosCargos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCargo = (id: number) => {
    setSelectedCargoIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Edición de Factura</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  N° {factura.numero} • {factura.cliente?.nombre}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar space-y-8">
          {/* Datos Básicos */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha Emisión</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-2xl pl-12 pr-5 py-4 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Observaciones Internas</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-2xl pl-12 pr-5 py-4 text-sm text-white outline-none transition-all resize-none"
                placeholder="Notas sobre esta factura..."
              />
            </div>
          </div>

          {/* Nuevos Items manuales */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Nuevos Items de Servicio
            </h3>
            
            <div className="grid grid-cols-[1fr,120px,120px,40px] gap-2">
              <input
                placeholder="Descripción del servicio..."
                value={newItem.descripcion}
                onChange={e => setNewItem(prev => ({ ...prev, descripcion: e.target.value }))}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
              />
              <select
                value={newItem.tipo}
                onChange={e => setNewItem(prev => ({ ...prev, tipo: e.target.value }))}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
              >
                <option value="MANTENIMIENTO">Mantenim.</option>
                <option value="SERVICIOS">Servicios</option>
                <option value="OTROS">Otros</option>
              </select>
              <input
                type="number"
                placeholder="Monto"
                value={newItem.monto}
                onChange={e => setNewItem(prev => ({ ...prev, monto: e.target.value }))}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={addNewItemRow}
                className="flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {nuevosCargos.length > 0 && (
              <div className="space-y-2">
                {nuevosCargos.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase">{item.descripcion}</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">{item.tipo}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-emerald-400">$ {item.monto.toLocaleString()}</span>
                      <button onClick={() => removeNewItem(idx)} className="text-slate-600 hover:text-rose-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vincular Cargos Existentes (ya implementado arriba pero lo dejamos como segunda opción) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Vincular Pendientes Existentes
              </h3>
            </div>

            <div className="bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
              {isLoadingCargos ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-600" /></div>
              ) : pendingCargos.length === 0 ? (
                <div className="p-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  No hay cargos pendientes para este cliente
                </div>
              ) : (
                pendingCargos.map((cargo) => (
                  <div
                    key={cargo.id}
                    onClick={() => toggleCargo(cargo.id)}
                    className="flex items-center justify-between p-5 hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        selectedCargoIds.includes(cargo.id) 
                          ? 'bg-indigo-500 border-indigo-400 text-white' 
                          : 'bg-slate-800 border-slate-700 text-transparent group-hover:border-slate-600'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{cargo.descripcion}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{cargo.tipo}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-indigo-400">$ {Number(cargo.monto).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Importe Original</p>
            <p className="text-xl font-black text-white">$ {Number(factura.total).toLocaleString()}</p>
          </div>
          
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center gap-3"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </div>
  );
};
