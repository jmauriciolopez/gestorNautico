import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOperaciones, useSolicitudesBajada, Pedido } from '../hooks/useOperaciones';
import { PedidosList } from '../components/PedidosList';
import { MovimientosList } from '../components/MovimientosList';
import { NuevoPedidoModal } from '../components/NuevoPedidoModal';
import { NuevoMovimientoModal } from '../components/NuevoMovimientoModal';
import { Activity, Plus, Clock, History } from 'lucide-react';
import { useConfirm } from '../../../shared/hooks/useConfirm';

type Tab = 'pedidos' | 'movimientos' | 'bajadas';

export default function OperacionesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'pedidos';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);
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
    <div className="space-y-10 max-w-[1600px] mx-auto overflow-visible">
      {/* Premium Header - Glassmorphism & Depth */}
      <motion.header 
        initial={{ opacity: 0, y: -40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-10 rounded-[var(--bento-radius)] border border-[var(--border-primary)] shadow-premium overflow-hidden group transition-all duration-700 bg-gradient-to-br from-[var(--bg-secondary)]/80 to-[var(--bg-surface)]/40 backdrop-blur-3xl"
      >
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-purple-500/5 rounded-full blur-[120px] group-hover:bg-purple-500/10 transition-all duration-1000" />

        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
          <Activity className="w-64 h-64 text-indigo-500" />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left: Title & Counter */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-[var(--text-primary)] leading-none tracking-tighter">OPERACIONES</h1>
              <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${activeTab === 'pedidos' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                {activeTab === 'pedidos' ? `${unifiedPedidos.length} Activas` : 'Bitácora'}
              </div>
            </div>
            <p className="text-ui-sm text-[var(--text-muted)] tracking-wide">Gestión centralizada de botadas y movimientos</p>
          </div>

          {/* Center: Integrated Tabs */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-primary)]/40 backdrop-blur-md rounded-full border border-[var(--border-primary)]/40 w-fit shadow-inner">
              {[
                { id: 'pedidos', label: 'Monitor de Cola', icon: Clock },
                { id: 'movimientos', label: 'Bitácora Histórica', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    setSearchParams({ tab: tab.id });
                  }}
                  className={`group flex items-center gap-3 px-8 py-3 rounded-full transition-all duration-500 ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-y-[-1px]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/60 active:scale-95'
                    }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-indigo-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="flex items-center gap-4 min-w-[240px] justify-end">
            {activeTab === 'pedidos' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPedidoModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 transition-all flex items-center gap-4 group/btn"
              >
                <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500" />
                Nueva Solicitud
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content Area - Refined Bento-Style Surface */}
      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--bg-surface)]/40 backdrop-blur-3xl border border-[var(--border-primary)]/60 rounded-[var(--bento-radius)] shadow-premium overflow-hidden relative min-h-[600px]"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
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
          </motion.div>
        </AnimatePresence>
      </motion.main>

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
