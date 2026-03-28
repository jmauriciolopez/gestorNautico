import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, User, Calendar, Receipt, Hash } from 'lucide-react';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useFinanzas, useCargos } from '../hooks/useFinanzas';

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrarPagoModal({ isOpen, onClose }: RegistrarPagoModalProps) {
  const { getClientes } = useClientes();
  const { createPago, getCajaResumen } = useFinanzas();

  const [formData, setFormData] = useState({
    clienteId: '',
    cargoId: '',
    monto: '',
    metodoPago: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE',
    referencia: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Fetch cargos for selected client
  const { data: cargos = [] } = useCargos(
    formData.clienteId ? Number(formData.clienteId) : undefined,
    true // solo sin facturar/pendientes
  );

  useEffect(() => {
    // If a cargo is selected, pre-fill the amount
    if (formData.cargoId) {
      const selectedCargo = cargos.find(c => c.id === Number(formData.cargoId));
      if (selectedCargo) {
        setFormData(prev => ({ ...prev, monto: selectedCargo.monto.toString() }));
      }
    }
  }, [formData.cargoId, cargos]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.monto) return;

    await createPago.mutateAsync({
      clienteId: Number(formData.clienteId),
      cargoId: formData.cargoId ? Number(formData.cargoId) : undefined,
      monto: Number(formData.monto),
      metodoPago: formData.metodoPago,
      referencia: formData.referencia,
      fecha: formData.fecha,
      cajaId: getCajaResumen.data?.id
    });

    onClose();
    setFormData({
      clienteId: '',
      cargoId: '',
      monto: '',
      metodoPago: 'EFECTIVO',
      referencia: '',
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-[var(--border-primary)]/60 w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden">

        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Registro de Pago</h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Ingreso de valores a tesorería</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Cliente pagador
              </label>
              <select
                required
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.clienteId}
                onChange={(e) => setFormData({ ...formData, clienteId: e.target.value, cargoId: '' })}
              >
                <option value="">Seleccionar Propietario...</option>
                {getClientes.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {formData.clienteId && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                  <Receipt className="w-3 h-3" /> Aplicar a cargo pendiente (OPCIONAL)
                </label>
                <select
                  className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  value={formData.cargoId}
                  onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })}
                >
                  <option value="">Pago a Cuenta / General</option>
                  {cargos.filter(c => !c.pagado).map(c => (
                    <option key={c.id} value={c.id}>{c.descripcion} - ${c.monto}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Monto Recibido
              </label>
              <input
                required
                type="number"
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Hash className="w-3 h-3" /> Referencia / N°
              </label>
              <input
                type="text"
                placeholder="Ej: Transf. 1928"
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                Medio de Pago
              </label>
              <select
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.metodoPago}
                onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as any })}
              >
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="TARJETA">TARJETA</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Fecha
              </label>
              <input
                type="date"
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-[var(--text-primary)] transition-all underline-offset-4"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={createPago.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {createPago.isPending ? 'Validando...' : 'Procesar Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
