import { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useOperaciones, useSolicitudesBajada, Pedido } from '../hooks/useOperaciones';
import { PedidosList } from '../components/PedidosList';
import { MovimientosList } from '../components/MovimientosList';
import { SolicitudesBajadaList } from '../components/SolicitudesBajadaList';
import { NuevoPedidoModal } from '../components/NuevoPedidoModal';
import { NuevoMovimientoModal } from '../components/NuevoMovimientoModal';
import { Activity, Plus, Clock, Anchor, History } from 'lucide-react';
import { useConfirm } from '../../../shared/hooks/useConfirm';

type Tab = 'pedidos' | 'movimientos' | 'bajadas';

export default function OperacionesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const { getPedidos, deletePedido, updatePedidoEstado, createPedido, createMovimiento } = useOperaciones();
  const { getSolicitudes, updateEstado: updateSolicitudEstado } = useSolicitudesBajada();
  const confirm = useConfirm();

  const unifiedPedidos = useMemo(() => {
    return [
      ...(getPedidos.data || []).map(p => ({ ...p, origen: 'interno' })),
      ...(getSolicitudes.data || []).filter(s => s.estado === 'PENDIENTE' || s.estado === 'EN_AGUA').map(s => ({
        id: s.id,
        estado: s.estado.toLowerCase() as any,
        fechaProgramada: s.fechaHoraDeseada,
        embarcacion: s.embarcacion,
        origen: 'web',
        observaciones: s.observaciones,
        isSolicitud: true
      }))
    ].sort((a, b) => new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime());
  }, [getPedidos.data, getSolicitudes.data]);

  const activeBoatIds = useMemo(() => 
    getPedidos.data?.map(p => p.embarcacion.id) || [],
  [getPedidos.data]);

  const handleUpdateStatusUnified = useCallback(async (id: number, nuevoEstado: Pedido['estado'], isSolicitud?: boolean) => {
    if (isSolicitud) {
      const statusMap: Record<string, any> = {
        'pendiente': 'PENDIENTE',
        'en_agua': 'EN_AGUA',
        'finalizado': 'FINALIZADA',
        'cancelado': 'CANCELADA'
      };
      await updateSolicitudEstado.mutateAsync({ id, estado: statusMap[nuevoEstado] });
    } else {
      await updatePedidoEstado.mutateAsync({ id, estado: nuevoEstado });
    }
  }, [updateSolicitudEstado, updatePedidoEstado]);

  const handleDeletePedidoUnified = useCallback(async (id: number, isSolicitud?: boolean) => {
    const title = isSolicitud ? 'Cancelar Solicitud Web' : 'Eliminar Solicitud';
    const message = isSolicitud
      ? '¿Estás seguro de que deseas cancelar esta solicitud web? El cliente será notificado.'
      : '¿Estás seguro de que deseas eliminar esta solicitud de botada? Esta acción no se puede deshacer.';

    const confirmed = await confirm({
      title,
      message,
      confirmText: isSolicitud ? 'Cancelar' : 'Eliminar',
      variant: 'danger'
    });

    if (confirmed) {
      if (isSolicitud) {
        await updateSolicitudEstado.mutateAsync({ id, estado: 'CANCELADA', motivo: 'Eliminado desde monitor central' });
      } else {
        await deletePedido.mutateAsync(id);
      }
    }
  }, [confirm, updateSolicitudEstado, deletePedido]);

  const handleCreatePedido = useCallback(async (data: { embarcacionId: number; fechaProgramada: string; observaciones?: string }) => {
    await createPedido.mutateAsync(data);
    setIsPedidoModalOpen(false);
  }, [createPedido]);

  const handleCreateMovimiento = useCallback(async (data: any) => {
    await createMovimiento.mutateAsync(data);
    setIsMovimientoModalOpen(false);
  }, [createMovimiento]);


  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header - Glassmorphism & Depth */}
      <header className="relative p-8 rounded-[3rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden group transition-all duration-500 bg-gradient-to-br from-[var(--bg-secondary)]/50 to-[var(--bg-surface)]/30 backdrop-blur-3xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] group-hover:bg-purple-500/10 transition-all duration-1000" />

        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
          <Activity className="w-56 h-56 text-indigo-500" />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left: Title & Counter */}
          <div className="flex items-baseline gap-4">
            <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Operaciones</h1>
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'pedidos' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
              {activeTab === 'pedidos' ? `${unifiedPedidos.length} Activas` : 'Bitácora'}
            </div>
          </div>

          {/* Center: Integrated Tabs */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 p-1 bg-[var(--bg-primary)]/30 backdrop-blur-md rounded-[2rem] border border-[var(--border-primary)]/40 w-fit">
              {[
                { id: 'pedidos', label: 'Monitor de Cola', icon: Clock },
                { id: 'movimientos', label: 'Bitácora Histórica', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`group flex items-center gap-3 px-6 py-2.5 rounded-[1.5rem] transition-all duration-500 ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/60'
                    }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-indigo-400'}`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="flex items-center gap-4 min-w-[200px] justify-end">
            {activeTab === 'pedidos' && (
              <button
                onClick={() => setIsPedidoModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-[1.75rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-4 group/btn"
              >
                <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500" />
                Nueva Solicitud
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Refined Bento-Style Surface */}
      <main className="bg-[var(--bg-surface)]/60 backdrop-blur-2xl border border-[var(--border-primary)]/80 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative transition-all duration-500 min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="relative z-10 transition-all duration-500">
          {activeTab === 'pedidos' && (
            <PedidosList
              pedidos={unifiedPedidos as any}
              isLoading={getPedidos.isLoading || getSolicitudes.isLoading}
              onUpdateStatus={handleUpdateStatusUnified}
              onDeletePedido={handleDeletePedidoUnified}
              onOpenCreate={() => setIsPedidoModalOpen(true)}
            />
          )}
          {activeTab === 'movimientos' && (
            <MovimientosList />
          )}
        </div>
      </main>

      <NuevoPedidoModal
        isOpen={isPedidoModalOpen}
        onClose={() => setIsPedidoModalOpen(false)}
        onSave={handleCreatePedido}
        activeBoatIds={getPedidos.data?.map(p => p.embarcacion.id) || []}
      />

      <NuevoMovimientoModal
        isOpen={isMovimientoModalOpen}
        onClose={() => setIsMovimientoModalOpen(false)}
        onSuccess={handleCreateMovimiento}
      />
    </div>
  );
}
