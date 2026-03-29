import React, { useState } from 'react';
import { Plus, RefreshCw, Receipt, FileText, ChevronRight } from 'lucide-react';
import { useFacturas } from '../hooks/useFacturas';
import { FacturasList } from '../components/FacturasList';
import { NuevaFacturaModal } from '../components/NuevaFacturaModal';
import { useConfirm } from '../../../shared/context/ConfirmContext';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';

export default function FacturacionPage() {
  const { getFacturas, updateEstadoFactura } = useFacturas();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const confirm = useConfirm();

  const handleUpdateEstado = async (id: number, estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA') => {
    const isLiquidar = estado === 'PAGADA';
    const label = isLiquidar ? 'Liquidar' : 'Anular';
    
    const confirmed = await confirm({
      title: isLiquidar ? 'Liquidar Factura' : 'Anular Factura',
      message: `¿Está seguro de que desea ${label} esta factura? Esta acción no se puede deshacer.`,
      confirmText: isLiquidar ? 'Liquidar' : 'Anular Factura',
      variant: isLiquidar ? 'primary' : 'danger'
    });

    if (confirmed) {
      try {
        await updateEstadoFactura.mutateAsync({ id, estado });
      } catch (error) {
        console.error('Error al actualizar el estado de la factura:', error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--bg-secondary)]/[0.3] p-10 rounded-[2.5rem] border border-[var(--border-primary)] relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <FileText className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Gestión de Emisión Documental</span>
          </div>
          <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Facturación</h1>
          <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2">Administración de comprobantes fiscales y estados de cuenta auditados.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => getFacturas.refetch()}
            className="p-3.5 text-[var(--text-secondary)] hover:text-indigo-400 transition-all bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl hover:border-indigo-500/40 active:scale-90"
            title="Sincronizar Panel"
          >
            <RefreshCw className={`w-5 h-5 ${getFacturas.isFetching ? 'animate-spin' : ''}`} />
          </button>
          <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-3 group/btn"
            >
              <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
              Nueva Factura
            </button>
          </RoleGuard>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-surface)] p-8 rounded-[2.5rem] border border-[var(--border-primary)] shadow-xl transition-colors duration-300">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none mb-1">Emitidas MTD</p>
              <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums">{getFacturas.data?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] p-8 rounded-[2.5rem] border border-[var(--border-primary)] shadow-xl transition-colors duration-300">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none mb-1">Volumen Total</p>
              <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums">
                ${getFacturas.data?.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="bg-[var(--bg-surface)] backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden transition-colors duration-300 group/grid min-h-[500px]">
        <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
          <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] leading-none">Registro Maestro de Comprobantes</h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            <span>Libro Fiscal</span>
            <ChevronRight className="w-4 h-4 opacity-30" />
          </div>
        </div>
        <FacturasList
          facturas={getFacturas.data || []}
          isLoading={getFacturas.isLoading}
          onUpdateEstado={handleUpdateEstado}
        />
      </main>

      <NuevaFacturaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
