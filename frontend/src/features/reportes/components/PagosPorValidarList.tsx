import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Loader2, Wallet, CheckCircle, ExternalLink, User, Search } from 'lucide-react';
import { FacturaDetailModal } from '../../facturacion/components/FacturaDetailModal';
import { LiquidarFacturaModal } from '../../facturacion/components/LiquidarFacturaModal';
import { toast } from 'react-hot-toast';

export function PagosPorValidarList() {
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'detail' | 'liquidar' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: facturas = [], isLoading, refetch } = useQuery({
    queryKey: ['reportes', 'pagos-por-validar'],
    queryFn: async () => {
      const response = await httpClient.get<any>('/facturas?soloReportados=true&limit=100');
      return (response.data || []).filter((f: any) => f.estado === 'PENDIENTE');
    }
  });

  const handleConfirmarLiquidar = async (facturaId: number, metodoPago: string) => {
    try {
      await httpClient.patch(`/facturas/${facturaId}/estado`, {
        estado: 'PAGADA',
        metodoPago
      });
      toast.success('Factura liquidada y pago confirmado');
      setActiveModal(null);
      setSelectedFactura(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al liquidar');
    }
  };

  const filteredFacturas = facturas.filter((f: any) =>
    f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.pagoIdComprobante?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Buscando reportes pendientes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Mini Search */}
      <div className="flex items-center gap-4 bg-[var(--bg-secondary)]/30 p-4 rounded-2xl border border-[var(--border-primary)]">
        <Search className="w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Buscar por Nro, Cliente o ID de Transacción..."
          className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)] w-full placeholder:text-[var(--text-disabled)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredFacturas.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <CheckCircle className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest">No hay pagos pendientes de validación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredFacturas.map((factura: any) => (
            <div
              key={factura.id}
              className="group bg-[var(--bg-secondary)]/20 border border-[var(--border-primary)] rounded-[2rem] p-6 hover:border-indigo-500/40 transition-all hover:shadow-2xl hover:shadow-indigo-500/5"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                      {factura.numero}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {factura.cliente?.nombre}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[var(--text-primary)] tabular-nums">
                    ${Number(factura.total).toLocaleString('es-AR')}
                  </p>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    Pago Informado
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--bg-primary)]/40 p-4 rounded-2xl border border-[var(--border-secondary)]">
                  <p className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-widest mb-1">ID Transacción</p>
                  <p className="text-xs font-black text-[var(--text-primary)] font-mono">{factura.pagoIdComprobante}</p>
                </div>
                <div className="bg-[var(--bg-primary)]/40 p-4 rounded-2xl border border-[var(--border-secondary)]">
                  <p className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-widest mb-1">Medio / Fecha</p>
                  <p className="text-xs font-black text-[var(--text-primary)]">
                    {factura.pagoMedio} · {factura.pagoFecha && !isNaN(new Date(factura.pagoFecha).getTime()) ? new Date(factura.pagoFecha).toLocaleDateString() : 'S/F'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedFactura(factura); setActiveModal('detail'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver Factura
                </button>
                <button
                  onClick={() => { setSelectedFactura(factura); setActiveModal('liquidar'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Validar y Liquidar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeModal === 'detail' && selectedFactura && (
        <FacturaDetailModal
          factura={selectedFactura}
          onClose={() => { setActiveModal(null); setSelectedFactura(null); }}
          onSendEmail={() => { }}
        />
      )}
      {activeModal === 'liquidar' && selectedFactura && (
        <LiquidarFacturaModal
          factura={selectedFactura}
          isPending={false}
          onConfirm={handleConfirmarLiquidar}
          onClose={() => { setActiveModal(null); setSelectedFactura(null); }}
        />
      )}
    </div>
  );
}
