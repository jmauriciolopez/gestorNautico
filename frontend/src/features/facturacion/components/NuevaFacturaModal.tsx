import React, { useState, useEffect } from 'react';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useCargos } from '../../finanzas/hooks/useFinanzas';
import { useFacturas } from '../hooks/useFacturas';
import { X, Search, FileText, Calendar, Loader2, FileCheck, Receipt, Hash } from 'lucide-react';

interface NuevaFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevaFacturaModal: React.FC<NuevaFacturaModalProps> = ({ isOpen, onClose }) => {
  const { getClientes } = useClientes();
  const { createFactura, getNextNumero } = useFacturas();

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [cargoIds, setCargoIds] = useState<number[]>([]);
  const [numero, setNumero] = useState('');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: cargos, isLoading: isLoadingCargos } = useCargos(clienteId || undefined, true);

  useEffect(() => {
    if (isOpen && getNextNumero.data?.nextNumero) {
      setNumero(getNextNumero.data.nextNumero);
    }
  }, [isOpen, getNextNumero.data?.nextNumero]);

  if (!isOpen) return null;

  const toggleCargo = (id: number) => {
    setCargoIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalFactura = cargos
    ?.filter(c => cargoIds.includes(c.id))
    .reduce((sum, c) => sum + Number(c.monto), 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || cargoIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await createFactura.mutateAsync({
        clienteId,
        numero,
        fechaEmision,
        cargoIds,
        observaciones
      });
      onClose();
      setClienteId(null);
      setCargoIds([]);
      setObservaciones('');
    } catch (error) {
      console.error('Error al crear la factura:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (monto: number) => {
    return `$${Number(monto).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--modal-glass-bg)] border border-[var(--border-strong)] w-full max-w-5xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        <div className="px-10 pt-10 pb-8 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Emisión de Comprobante</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Agrupación de cargos y facturación formal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Left Panel: Configuration */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-4 bg-[var(--bg-primary)]/40 p-6 rounded-2xl border border-[var(--border-primary)]/60">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                    Seleccionar Receptor
                  </label>
                  <select
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors uppercase font-bold appearance-none cursor-pointer"
                    value={clienteId?.toString() || ''}
                    onChange={(e) => {
                      setClienteId(Number(e.target.value));
                      setCargoIds([]);
                    }}
                    required
                  >
                    <option value="">Elegir Cliente...</option>
                    {getClientes.data?.data?.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (DNI: {c.dni})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                      <Hash className="w-3 h-3 text-indigo-400" /> Nº Interno
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors font-bold uppercase"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="X-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors font-bold [color-scheme:dark] brightness-90 contrast-125"
                      value={fechaEmision}
                      onChange={(e) => setFechaEmision(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Observaciones Fiscales</label>
                  <textarea
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-none pb-4"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas internas o aclaraciones para el cliente..."
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-[var(--text-primary)] shadow-2xl shadow-indigo-900/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <FileCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Total Liquidación</span>
                    <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 text-[9px] font-black uppercase tracking-widest">
                      {cargoIds.length} CONCEPTOS
                    </div>
                  </div>
                  <div className="text-6xl font-black tracking-tighter tabular-nums">
                    {formatCurrency(totalFactura)}
                  </div>
                  <p className="mt-5 text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest italic leading-relaxed">
                    Certificado de liquidación interno listo para registro contable.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel: Picker */}
            <div className="md:col-span-3 flex flex-col h-[550px]">
              <div className="flex items-center justify-between mb-4 px-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Selección de Cargos Pendientes</label>
                {cargoIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCargoIds([])}
                    className="text-[9px] font-black text-indigo-400 hover:text-[var(--text-primary)] uppercase tracking-widest"
                  >
                    Limpiar Selección
                  </button>
                )}
              </div>

              <div className="flex-1 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)]/60 rounded-[2rem] overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                  {!clienteId ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] p-12 text-center">
                      <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center mb-6 opacity-40">
                        <Search className="w-8 h-8" />
                      </div>
                      <h4 className="text-[var(--text-primary)] font-black text-sm uppercase tracking-tight mb-2">Esperando Cliente</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Seleccione un receptor en el panel izquierdo para auditar su estado de cuenta.</p>
                    </div>
                  ) : isLoadingCargos ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                  ) : cargos?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] p-8 text-center">
                      <FileText className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">Sin deudas pendientes detectadas para este perfil.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cargos?.map(cargo => (
                        <div
                          key={cargo.id}
                          onClick={() => toggleCargo(cargo.id)}
                          className={`flex items-center gap-5 p-5 rounded-2xl border transition-all cursor-pointer group ${cargoIds.includes(cargo.id)
                            ? 'bg-indigo-600/10 border-indigo-500/40'
                            : 'bg-[var(--bg-primary)]/40 border-[var(--border-primary)]/40 hover:border-indigo-400'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${cargoIds.includes(cargo.id)
                            ? 'bg-indigo-600 border-indigo-500 text-[var(--text-primary)]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-transparent'
                            }`}>
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{cargo.descripcion}</div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] font-black bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2 py-0.5 rounded uppercase tracking-wider border border-[var(--border-primary)]">
                                {cargo.tipo}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-[var(--bg-secondary)]" />
                              <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5 font-bold uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                {new Date(cargo.fechaEmision).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-lg font-black text-[var(--text-primary)] tabular-nums tracking-tighter">
                            {formatCurrency(cargo.monto)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Combined Actions */}
          <div className="flex flex-col sm:flex-row gap-5 pt-8 mt-6 border-t border-[var(--border-primary)]/60 items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-10 py-5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all order-2 sm:order-1 active:scale-95"
            >
              Cancelar Emisión
            </button>
            <button
              type="submit"
              disabled={isSubmitting || cargoIds.length === 0}
              className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-900/40 active:scale-95 flex items-center justify-center gap-3 transition-all order-1 sm:order-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <><FileCheck className="w-5 h-5" /> Confirmar y Generar Factura</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
