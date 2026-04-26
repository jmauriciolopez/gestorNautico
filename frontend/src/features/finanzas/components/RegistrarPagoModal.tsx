import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, User, Calendar, Receipt, Hash, Loader2, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useFinanzas, useCargos, Cargo } from '../hooks/useFinanzas';

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCargo?: Cargo | null;
}

const PortalSelect = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 transition-all text-left flex justify-between items-center"
      >
        <span>{options.find(o => o.value === value)?.label || 'Seleccionar...'}</span>
        <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[200]" onClick={() => setIsOpen(false)}>
          <div
            className="absolute bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden py-2"
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            onClick={(e) => e.stopPropagation()}
          >
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-[var(--bg-card-hover)] ${value === o.value ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--text-primary)]'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export function RegistrarPagoModal({ isOpen, onClose, initialCargo }: RegistrarPagoModalProps) {
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
    if (isOpen) {
      if (initialCargo) {
        setFormData({
          clienteId: initialCargo.cliente.id.toString(),
          cargoId: initialCargo.id.toString(),
          monto: initialCargo.monto.toString(),
          metodoPago: 'EFECTIVO',
          referencia: '',
          fecha: new Date().toISOString().split('T')[0]
        });
      } else {
        setFormData({
          clienteId: '',
          cargoId: '',
          monto: '',
          metodoPago: 'EFECTIVO',
          referencia: '',
          fecha: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, initialCargo]);

  useEffect(() => {
    // If a cargo is manually selected, pre-fill the amount
    if (formData.cargoId && !initialCargo) { // Only if not pre-filled by initialCargo
      const selectedCargo = cargos.find(c => c.id === Number(formData.cargoId));
      if (selectedCargo) {
        setFormData(prev => ({ ...prev, monto: selectedCargo.monto.toString() }));
      }
    }
  }, [formData.cargoId, cargos, initialCargo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.monto) return;

    try {
      await createPago.mutateAsync({
        clienteId: Number(formData.clienteId),
        cargoId: formData.cargoId ? Number(formData.cargoId) : undefined,
        monto: Number(formData.monto),
        metodoPago: formData.metodoPago,
        referencia: formData.referencia,
        fecha: formData.fecha,
        cajaId: getCajaResumen.data?.id
      });

      toast.success('Pago registrado correctamente');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar el pago');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-primary)] w-full max-w-lg rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[calc(100vh-2rem)] transform animate-in slide-in-from-bottom-8 duration-500 custom-scrollbar">

        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Registro de Pago</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Ingreso de valores a tesorería</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--bg-card-hover)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 px-1">
                <User className="w-3 h-3 text-indigo-500" /> Cliente pagador
              </label>
              <select
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                value={formData.clienteId}
                onChange={(e) => setFormData({ ...formData, clienteId: e.target.value, cargoId: '' })}
              >
                <option value="">Seleccionar Propietario...</option>
                {getClientes.data?.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {formData.clienteId && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 px-1">
                  <Receipt className="w-3 h-3 text-indigo-500" /> Cargos Pendientes
                </label>
                <select
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                  value={formData.cargoId}
                  onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })}
                >
                  <option value="">Pago a Cuenta / General</option>
                  {cargos.filter(c => !c.pagado).map(c => (
                    <option key={c.id} value={c.id}>{c.descripcion} — ${Number(c.monto).toLocaleString()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 px-1">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Monto Recibido
              </label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">$</span>
                <input
                  required
                  type="number"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl pl-10 pr-5 py-4 text-sm font-black text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-[var(--text-muted)]"
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 px-1">
                <Hash className="w-3 h-3 text-indigo-500" /> Referencia
              </label>
              <input
                type="text"
                placeholder="Ej: Transf. 1928"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-[var(--text-muted)]"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 px-1">
                Medio de Pago
              </label>
              <PortalSelect
                value={formData.metodoPago}
                onChange={(val) => setFormData({ ...formData, metodoPago: val as any })}
                options={[
                  { value: 'EFECTIVO', label: 'EFECTIVO' },
                  { value: 'TRANSFERENCIA', label: 'TRANSFERENCIA' },
                  { value: 'TARJETA', label: 'TARJETA' },
                  { value: 'CHEQUE', label: 'CHEQUE' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 px-1">
                <Calendar className="w-3 h-3 text-indigo-500" /> Fecha Valor
              </label>
              <input
                type="date"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPago.isPending}
              className="flex-[1.5] px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
            >
              {createPago.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Procesar Cobro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
