import { useState } from 'react';
import { useOperaciones, useSolicitudesBajada, Pedido } from '../hooks/useOperaciones';
import { PedidosList } from '../components/PedidosList';
import { MovimientosList } from '../components/MovimientosList';
import { SolicitudesBajadaList } from '../components/SolicitudesBajadaList';
import { NuevoPedidoModal } from '../components/NuevoPedidoModal';
import { Activity, Plus, Ship, Clock, Anchor } from 'lucide-react';
import { useConfirm } from '../../../shared/context/ConfirmContext';

type Tab = 'pedidos' | 'movimientos' | 'bajadas';

export default function OperacionesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const { getPedidos, deletePedido, updatePedidoEstado, createPedido } = useOperaciones();
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header - Glassmorphism & Depth */}
      <header className="relative p-12 rounded-[3.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden group transition-all duration-500 bg-gradient-to-br from-[var(--bg-secondary)]/50 to-[var(--bg-surface)]/30 backdrop-blur-3xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] group-hover:bg-purple-500/10 transition-all duration-1000" />
        
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
          <Activity className="w-56 h-56 text-indigo-500" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Anchor className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Logistics Terminal</span>
                </div>
                <h1 className="text-[3rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Operaciones</h1>
              </div>
            </div>
            <p className="max-w-2xl text-[var(--text-secondary)] text-sm font-medium leading-relaxed opacity-80 border-l-2 border-indigo-500/30 pl-6">
              Gestión centralizada de botadas, izadas y movimientos internos de flota. 
              <span className="block mt-1 text-[10px] uppercase font-black tracking-widest text-indigo-500/60">Trazabilidad total garantizada</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPedidoModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-4 group/btn"
            >
              <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500" />
              Nueva Solicitud
            </button>
          </div>
        </div>
      </header>

      {/* Modern High-Fidelity Tabs Container */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--bg-secondary)]/40 backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-primary)]/60 w-fit shadow-2xl transition-all duration-500 hover:border-indigo-500/20">
        {[
          { id: 'pedidos', label: 'Monitor de Cola', icon: Clock, desc: 'Activas' },
          { id: 'movimientos', label: 'Bitácora Histórica', icon: Ship, desc: 'Historial' },
          { id: 'bajadas', label: 'Solicitudes Web', icon: Activity, desc: 'Externas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`group flex items-center gap-4 px-8 py-4 rounded-[1.75rem] transition-all duration-500 ${activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-y-[-2px]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/60'
              }`}
          >
            <div className={`p-2.5 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--bg-surface)]/60 group-hover:bg-indigo-500/10'}`}>
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-indigo-400'}`} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</p>
              <p className={`text-[8px] font-bold uppercase tracking-[0.1em] mt-0.5 ${activeTab === tab.id ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                {tab.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content Area - Refined Bento-Style Surface */}
      <main className="bg-[var(--bg-surface)]/60 backdrop-blur-2xl border border-[var(--border-primary)]/80 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative transition-all duration-500 min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <div className="px-12 py-10 border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              {activeTab === 'pedidos' ? <Clock className="w-6 h-6" /> : <Ship className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-[0.25em] leading-none mb-1">
                {activeTab === 'pedidos' ? 'Monitor de Botadas en Vivo' : activeTab === 'movimientos' ? 'Bitácora de Maniobras' : 'Portal de Solicitudes Web'}
              </h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60">Sincronizado en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>

        <div className="relative z-10 transition-all duration-500">
          {activeTab === 'pedidos' && (
            <PedidosList
              pedidos={getPedidos.data || []}
              isLoading={getPedidos.isLoading}
              onUpdateStatus={handleUpdateStatus}
              onDeletePedido={handleDeletePedido}
              onOpenCreate={() => setIsPedidoModalOpen(true)}
            />
          )}
          {activeTab === 'movimientos' && (
            <MovimientosList />
          )}
          {activeTab === 'bajadas' && (
            <SolicitudesBajadaList
              solicitudes={getSolicitudes.data || []}
              isLoading={getSolicitudes.isLoading}
              onUpdateEstado={(id, estado, motivo) => updateSolicitudEstado.mutateAsync({ id, estado, motivo })}
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
