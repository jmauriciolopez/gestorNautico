import { useState } from 'react';
import { useOperaciones, useSolicitudesBajada, Pedido } from '../hooks/useOperaciones';
import { PedidosList } from '../components/PedidosList';
import { MovimientosList } from '../components/MovimientosList';
import { SolicitudesBajadaList } from '../components/SolicitudesBajadaList';
import { NuevoPedidoModal } from '../components/NuevoPedidoModal';
import { Activity, Plus, Ship, Clock, ChevronRight, Anchor } from 'lucide-react';
import { useConfirm } from '../../../shared/context/ConfirmContext';

type Tab = 'pedidos' | 'movimientos' | 'bajadas';

export default function OperacionesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const { getPedidos, getMovimientos, deletePedido, updatePedidoEstado, createPedido } = useOperaciones();
  const { getSolicitudes, updateEstado: updateSolicitudEstado } = useSolicitudesBajada();
  const confirm = useConfirm();

  const handleUpdateStatus = async (id: number, nuevoEstado: Pedido['estado']) => {
    await updatePedidoEstado.mutateAsync({ id, estado: nuevoEstado });
  };

  const handleDeletePedido = async (id: number) => {
    const confirmed = await confirm({
      title: 'Eliminar Solicitud',
      message: '¿Estás seguro de que deseas eliminar esta solicitud de botada? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'danger'
    });

    if (confirmed) {
      await deletePedido.mutateAsync(id);
    }
  };

  const handleCreatePedido = async (data: { embarcacionId: number; fechaProgramada: string }) => {
    await createPedido.mutateAsync(data);
    setIsPedidoModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--bg-secondary)]/[0.3] p-10 rounded-[2.5rem] border border-[var(--border-primary)] relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Activity className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Centro de Logística & Flotas</span>
          </div>
          <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Operaciones</h1>
          <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2">Gestión de botadas, izadas y movimientos internos de flota auditados.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => setIsPedidoModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-3 group/btn"
          >
            <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
            Nueva Solicitud
          </button>
        </div>
      </header>

      {/* Modern High-Fidelity Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-secondary)]/[0.5] rounded-[2rem] border border-[var(--border-primary)] w-fit shadow-xl transition-colors duration-300">
        {[
          { id: 'pedidos', label: 'Solicitudes en Cola', icon: Clock },
          { id: 'movimientos', label: 'Historial de Maniobras', icon: Ship },
          { id: 'bajadas', label: 'Bajadas Públicas', icon: Anchor },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-3 px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
              ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
              }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden relative group/grid transition-colors duration-300 min-h-[500px]">
        <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
          <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] leading-none">
            {activeTab === 'pedidos' ? 'Monitor de Solicitudes de Botada' : 'Libro de Movimientos Históricos'}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            <span>Centro de Mandos</span>
            <ChevronRight className="w-4 h-4 opacity-30" />
          </div>
        </div>

        <div className="p-2 transition-all duration-500">
          {activeTab === 'pedidos' ? (
            <PedidosList
              pedidos={getPedidos.data || []}
              isLoading={getPedidos.isLoading}
              onUpdateStatus={handleUpdateStatus}
              onDeletePedido={handleDeletePedido}
              onOpenCreate={() => setIsPedidoModalOpen(true)}
            />
          ) : (
            <MovimientosList
              movimientos={getMovimientos.data || []}
              isLoading={getMovimientos.isLoading}
            />
          )}
        </div>
      </main>

      <NuevoPedidoModal
        isOpen={isPedidoModalOpen}
        onClose={() => setIsPedidoModalOpen(false)}
        onSave={handleCreatePedido}
      />
    </div>
  );
}
