import React, { useState, useEffect, useCallback } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, Save, Plus, Loader2, FileText, CheckCircle2, Trash2 } from 'lucide-react';

interface FacturaEditModalProps {
  factura: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const FacturaEditModal: React.FC<FacturaEditModalProps> = ({ factura, onClose, onSuccess }) => {
  const [fecha, setFecha] = useState(() => {
    try {
      return factura.fechaEmision ? new Date(factura.fechaEmision).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const [observaciones, setObservaciones] = useState(factura.observaciones || '');
  const [pendingCargos, setPendingCargos] = useState<any[]>([]);
  const [isLoadingCargos, setIsLoadingCargos] = useState(true);
  
  // Estado para nuevos cargos creados al vuelo
  const [nuevosCargos, setNuevosCargos] = useState<{ id: string; descripcion: string; monto: number; tipo: string }[]>([]);
  const [selectedCargoIds, setSelectedCargoIds] = useState<number[]>(factura.cargos?.map((c: any) => c.id) || []);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPendingCargos = useCallback(async () => {
    try {
      const data = await httpClient.get<any>(`/cargos?clienteId=${factura.cliente.id}&soloSinFacturar=true`);
      const items = Array.isArray(data) ? data : (data.items || []);
      setPendingCargos(items);
    } catch (error) {
      console.error('Error fetching pending cargos:', error);
    } finally {
      setIsLoadingCargos(false);
    }
  }, [factura.cliente.id]);

  useEffect(() => {
    fetchPendingCargos();
  }, [fetchPendingCargos]);

  const calculateTotal = () => {
    const existingTotal = pendingCargos
      .filter(c => selectedCargoIds.includes(c.id))
      .reduce((sum, c) => sum + Number(c.monto), 0);
    const alreadyFacturedOriginalTotal = factura.cargos
      ?.filter((c: any) => selectedCargoIds.includes(c.id))
      .reduce((sum: number, c: any) => sum + Number(c.monto), 0) || 0;
    const newTotal = nuevosCargos.reduce((sum, c) => sum + Number(c.monto), 0);
    return alreadyFacturedOriginalTotal + existingTotal + newTotal;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await httpClient.patch(`/facturas/${factura.id}`, {
        fechaEmision: fecha,
        observaciones,
        cargoIds: selectedCargoIds,
        nuevosCargos: nuevosCargos.map(({ monto }) => ({ monto: Number(monto) }))
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewItem = () => {
    setNuevosCargos(prev => [
      ...prev, 
      { id: Math.random().toString(36).substr(2, 9), descripcion: '', monto: 0, tipo: 'SERVICIOS' }
    ]);
  };

  const updateNewItem = (id: string, field: string, value: any) => {
    setNuevosCargos(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeNewItem = (id: string) => {
    setNuevosCargos(prev => prev.filter(item => item.id !== id));
  };

  const toggleCargo = (id: number) => {
    setSelectedCargoIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[calc(100vh-2rem)] flex flex-col relative z-10 font-sans custom-scrollbar"
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 border-b border-[var(--border-secondary)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] group border border-[var(--accent-primary-ring)] shadow-sm">
                <Edit3 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Editar Factura</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em]">{factura.numero}</span>
                  <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{factura.cliente?.nombre}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all active:scale-95 shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[var(--bg-primary)]/40">
          <div className="space-y-10">
            {/* Configuración General */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-[var(--accent-primary)]" /> Fecha Emisión
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] focus:border-[var(--accent-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] outline-none transition-all hover:bg-[var(--bg-secondary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-[var(--accent-primary)]" /> Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={1}
                  className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] focus:border-[var(--accent-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] outline-none transition-all hover:bg-[var(--bg-secondary)] resize-none placeholder:text-[var(--text-disabled)]"
                  placeholder="Notas internas de esta factura..."
                />
              </div>
            </div>

            {/* Nuevos Items Rápidos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--accent-teal)]" />
                  Items Agregados al Vuelo
                </h3>
                <button
                  onClick={addNewItem}
                  className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:brightness-110 transition-colors bg-[var(--accent-primary-soft)] px-4 py-2 rounded-xl border border-[var(--accent-primary-ring)]"
                >
                  + Añadir Fila
                </button>
              </div>

              {nuevosCargos.length === 0 ? (
                <div 
                  onClick={addNewItem}
                  className="p-10 border border-dashed border-[var(--border-secondary)] rounded-3xl text-center cursor-pointer hover:border-[var(--border-primary)] transition-colors bg-[var(--bg-secondary)]/20"
                >
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">¿Necesitas agregar items nuevos?</p>
                  <p className="text-[8px] text-[var(--text-disabled)] font-bold mt-1 uppercase tracking-tight">Haz clic aquí para añadir cargos directos a esta factura</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {nuevosCargos.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-4 bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--border-primary)] group hover:border-[var(--border-strong)] transition-all font-mono"
                      >
                        <input
                          placeholder="Descripción del cargo..."
                          value={item.descripcion}
                          onChange={(e) => updateNewItem(item.id, 'descripcion', e.target.value)}
                          className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                        />
                        <select
                          value={item.tipo}
                          onChange={(e) => updateNewItem(item.id, 'tipo', e.target.value)}
                          className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-[10px] font-black text-[var(--accent-primary)] outline-none uppercase tracking-widest"
                        >
                          <option value="SERVICIOS">Servicios</option>
                          <option value="MANTENIMIENTO">Mant.</option>
                          <option value="OTROS">Otros</option>
                        </select>
                        <div className="flex items-center gap-2">
                           <span className="text-[var(--text-disabled)] font-black text-xs">$</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.monto || ''}
                            onChange={(e) => updateNewItem(item.id, 'monto', parseFloat(e.target.value))}
                            className="w-24 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-xs text-[var(--accent-teal)] font-black text-right outline-none"
                          />
                        </div>
                        <button onClick={() => removeNewItem(item.id)} className="p-2 text-[var(--text-disabled)] hover:text-[var(--danger)] transition-colors bg-[var(--bg-soft)] rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Vincular Cargos existentes */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--accent-primary)]" />
                Vincular Cargos Pendientes
              </h3>
              <div className="bg-[var(--bg-secondary)]/30 rounded-3xl border border-[var(--border-primary)] overflow-hidden divide-y divide-[var(--border-secondary)] font-mono">
                {isLoadingCargos ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] opacity-20" />
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Consultando registros...</p>
                  </div>
                ) : pendingCargos.length === 0 ? (
                  <div className="p-12 text-center text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest bg-[var(--bg-soft)]">
                    No se hallaron cargos pendientes para vincular
                  </div>
                ) : (
                  pendingCargos.map((cargo) => (
                    <div
                      key={cargo.id}
                      onClick={() => toggleCargo(cargo.id)}
                      className="flex items-center justify-between p-6 hover:bg-[var(--bg-soft)] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                          selectedCargoIds.includes(cargo.id) 
                            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary-ring)] text-white translate-x-1 shadow-lg shadow-indigo-600/20' 
                            : 'bg-[var(--bg-primary)] border-[var(--border-secondary)] text-transparent group-hover:border-[var(--border-strong)]'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">{cargo.descripcion}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">{cargo.tipo}</span>
                            <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                            <span className="text-[9px] text-[var(--text-disabled)] font-bold">{new Date(cargo.fechaEmision).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[var(--accent-primary)]">$ {Number(cargo.monto).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/50 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest uppercase">Total Proyectado</span>
            <span className="text-2xl font-black text-[var(--accent-teal)] tracking-tight">
              $ {calculateTotal().toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-[var(--bg-elevated)] text-[var(--text-muted)] font-black uppercase tracking-widest rounded-2xl hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all active:scale-95 border border-[var(--border-secondary)]"
            >
              Cancelar
            </button>
            <button
              disabled={isSaving}
              onClick={handleSave}
              className="px-10 py-4 bg-[var(--accent-primary)] text-white font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-indigo-600/20 flex items-center gap-3"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Cambios
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
