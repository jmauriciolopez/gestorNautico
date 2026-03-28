import React, { useState } from 'react';
import { X, Receipt, DollarSign, User, Calendar, Tag } from 'lucide-react';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useFinanzas } from '../hooks/useFinanzas';

interface NuevoCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NuevoCargoModal({ isOpen, onClose }: NuevoCargoModalProps) {
  const { getClientes } = useClientes();
  const { createCargo } = useFinanzas();

  const [formData, setFormData] = useState({
    clienteId: '',
    descripcion: '',
    monto: '',
    tipo: 'AMARRE' as 'AMARRE' | 'MANTENIMIENTO' | 'SERVICIOS' | 'OTROS',
    fechaEmision: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId) return;

    await createCargo.mutateAsync({
      clienteId: Number(formData.clienteId),
      descripcion: formData.descripcion,
      monto: Number(formData.monto),
      tipo: formData.tipo,
      fechaEmision: formData.fechaEmision
    });

    onClose();
    setFormData({
      clienteId: '',
      descripcion: '',
      monto: '',
      tipo: 'AMARRE',
      fechaEmision: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-[var(--border-primary)]/60 w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden">

        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Emisión de Cargo</h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Generar nuevo concepto de cobro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Seleccionar Cliente
            </label>
            <select
              required
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              value={formData.clienteId}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            >
              <option value="">Elegir Propietario...</option>
              {getClientes.data?.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} (DNI: {c.dni})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3 h-3" /> Categoría
              </label>
              <select
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
              value={formData.fechaEmision}
              onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
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
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors resize-none"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-[var(--text-primary)] transition-all underline-offset-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCargo.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {createCargo.isPending ? 'Procesando...' : 'Confirmar Cargo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
