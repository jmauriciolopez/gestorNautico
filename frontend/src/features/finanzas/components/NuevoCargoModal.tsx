import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { X, Receipt, DollarSign, User, Calendar, Tag, Loader2 } from 'lucide-react';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useCargosPaginados } from '../hooks/useFinanzas';
import { useConfiguracion } from '../../configuracion/hooks/useConfiguracion';

interface NuevoCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NuevoCargoModal({ isOpen, onClose }: NuevoCargoModalProps) {
  const { getClientes } = useClientes();
  const { createCargo } = useCargosPaginados(1);
  const { getConfiguraciones } = useConfiguracion();

  const diasVencimiento = useMemo(() => {
    const configs = getConfiguraciones.data?.data || [];
    return Number(configs.find(c => c.clave === 'DIAS_VENCIMIENTO')?.valor ?? 15);
  }, [getConfiguraciones.data]);

  const calcVencimiento = (emision: string) => {
    const d = new Date(emision);
    d.setDate(d.getDate() + diasVencimiento);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    clienteId: '',
    descripcion: '',
    monto: '',
    tipo: 'AMARRE' as 'AMARRE' | 'MANTENIMIENTO' | 'SERVICIOS' | 'OTROS',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: calcVencimiento(new Date().toISOString().split('T')[0]),
  });

  // Recalcular vencimiento cuando carga la config
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fechaVencimiento: calcVencimiento(prev.fechaEmision),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diasVencimiento]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId) return;

    try {
      await createCargo.mutateAsync({
        clienteId: Number(formData.clienteId),
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        tipo: formData.tipo,
        fechaEmision: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
      });
      toast.success('Cargo emitido correctamente');
      onClose();
      setFormData({
        clienteId: '',
        descripcion: '',
        monto: '',
        tipo: 'AMARRE',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: calcVencimiento(new Date().toISOString().split('T')[0]),
      });
    } catch (err) {
      console.error('Error al crear el cargo:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-strong)] w-full max-w-lg rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Emisión de Cargo</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Generar nuevo concepto de cobro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Seleccionar Cliente
            </label>
            <select
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer uppercase"
              value={formData.clienteId}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            >
              <option value="" disabled>Seleccionar cliente...</option>
              {getClientes.data?.data?.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3 h-3" /> Categoría
              </label>
              <select
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer uppercase"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              >
                <option value="AMARRE">AMARRENTAMIENTO</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                <option value="SERVICIOS">SERVICIOS</option>
                <option value="OTROS">OTROS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Monto Neto
              </label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black tabular-nums"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Fecha de Registro
            </label>
            <input
              type="date"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black [color-scheme:dark]"
              value={formData.fechaEmision}
              onChange={(e) => {
                const emision = e.target.value;
                setFormData({
                  ...formData,
                  fechaEmision: emision,
                  fechaVencimiento: calcVencimiento(emision),
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Fecha de Vencimiento
            </label>
            <input
              type="date"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black [color-scheme:dark]"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              Descripción del Concepto
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detalle del servicio o cargo..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 focus:outline-none focus:border-indigo-500 transition-all resize-none font-bold"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCargo.isPending}
              className="flex-[1.5] px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
            >
              {createCargo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cargo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
