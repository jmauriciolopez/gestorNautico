import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Ship,
  Navigation,
  Activity,
  MapPin,
  ArrowUpRight,
  Anchor,
} from 'lucide-react';
import { useRackMap } from '../hooks/useDashboard';
import { MapaRacks } from '../components/MapaRacks';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { useOperaciones } from '../../operaciones/hooks/useOperaciones';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EstadoEmbarcacion, TipoMovimiento } from '../../../shared/types/enums';

const MetricCard = React.memo(({
  icon,
  label,
  value,
  accent,
  delay = 0,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'teal' | 'purple' | 'amber';
  delay?: number;
  onClick?: () => void;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
    aria-label={`${label}: ${value}`}
    className={`bento-card p-8 group transition-all duration-500 shadow-sm hover:shadow-premium bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border-[var(--border-primary)]/50 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]`}
  >
    <div className={`bento-icon accent-${accent} transition-transform duration-500 group-hover:scale-110 shadow-lg shadow-${accent}-500/10`}>{icon}</div>
    <div className="flex items-baseline gap-1 mt-2">
      <div className="kpi-value text-4xl font-black tracking-tighter">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50 mb-1">Total</div>
    </div>
    <div className="section-subtitle mt-2 text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{label}</div>
    
    <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:rotate-12`}>
      {icon}
    </div>
  </motion.div>
));

const DashboardOperativo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [is3D, setIs3D] = useState(false);

  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const { getMovimientos, createMovimiento } = useOperaciones();

  const embarcaciones = useMemo(() => getEmbarcaciones.data?.data || [], [getEmbarcaciones.data]);
  const movimientos = useMemo(() => getMovimientos.data || [], [getMovimientos.data]);

  const { enCuna, enAgua, libres } = useMemo(() => ({
    enCuna: embarcaciones.filter((e) => e.estado_operativo === EstadoEmbarcacion.EN_CUNA).length,
    enAgua: embarcaciones.filter((e) => e.estado_operativo === EstadoEmbarcacion.EN_AGUA).length,
    libres: embarcaciones.filter((e) => !e.espacioId && e.estado_operativo !== EstadoEmbarcacion.INACTIVA).length
  }), [embarcaciones]);

  const movimientosHoy = useMemo(() => movimientos.filter((m) => {
    const fecha = new Date(m.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }), [movimientos]);

  const embarcacionesLibres = useMemo(() => 
    embarcaciones.filter((e) => !e.espacioId && e.estado_operativo !== EstadoEmbarcacion.INACTIVA),
  [embarcaciones]);

  const handleAsignarBarco = useCallback(async (
    embarcacionId: number,
    espacioId: number
  ) => {
    try {
      await updateEmbarcacion.mutateAsync({ id: embarcacionId, data: { espacioId } });
      toast.success('Embarcación asignada');
    } catch (error: any) {
      console.error('Error al asignar:', error);
    }
  }, [updateEmbarcacion]);

  const handleRegistrarSalida = useCallback(async (embarcacionId: number, tipo: TipoMovimiento = TipoMovimiento.SALIDA) => {
    try {
      await createMovimiento.mutateAsync({ 
        embarcacionId, 
        tipo,
        observaciones: `Registro de ${tipo} desde mapa de racks`
      });
      const msg = tipo === TipoMovimiento.SALIDA ? 'Salida registrada - Embarcación en el agua' : 'Entrada registrada - Embarcación en cuna';
      toast.success(msg);
    } catch {
      toast.error(`Error al registrar ${tipo}`);
    }
  }, [createMovimiento]);


  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 overflow-visible">
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-10 rounded-[var(--bento-radius)] border border-[var(--border-primary)] shadow-premium overflow-hidden group transition-all duration-700 bg-gradient-to-br from-[var(--bg-secondary)]/80 to-[var(--bg-surface)]/40 backdrop-blur-3xl"
      >
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-[120px] group-hover:bg-teal-500/20 transition-all duration-1000" />
        
        <div
          className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-1000"
        >
          <Navigation className="w-48 h-48" style={{ color: 'var(--accent-teal)' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-3 w-3">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: 'var(--accent-teal)' }}
                />
                <span
                  className="relative inline-flex h-3 w-3 rounded-full"
                  style={{ backgroundColor: 'var(--accent-teal)' }}
                />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-teal)]">
                OPERACIÓN ACTIVA
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-[var(--text-primary)] leading-none">
              Hola, {user?.nombre?.split(' ')[0]}
            </h1>

            <p className="text-ui-sm mt-3 font-medium text-[var(--text-muted)] tracking-wide">
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/operaciones')}
              aria-label="Ir a nueva operación"
              className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-teal-900/40 transition-all flex items-center gap-4 group/btn"
            >
              <Navigation size={18} className="group-hover/btn:rotate-12 transition-transform" />
              NUEVA OPERACIÓN
            </motion.button>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          accent="amber"
          label="En cuna"
          value={enCuna}
          delay={0.1}
          icon={<Anchor size={20} style={{ color: 'var(--accent-amber)' }} />}
        />
        <MetricCard
          accent="purple"
          label="En agua"
          value={enAgua}
          delay={0.2}
          icon={<Ship size={20} style={{ color: 'var(--accent-purple)' }} />}
        />
        <MetricCard
          accent="teal"
          label="Sin ubicar"
          value={libres}
          delay={0.3}
          icon={<MapPin size={20} style={{ color: 'var(--accent-teal)' }} />}
        />
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bento-card overflow-hidden shadow-premium"
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div>
            <div className="section-title">Mapa de espacios</div>
            <div className="section-subtitle mt-1">Infraestructura operativa en tiempo real</div>
          </div>

          <button
            onClick={() => setIs3D(!is3D)}
            className="btn btn-secondary"
            style={{
              color: is3D ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: is3D ? 'var(--accent-primary-soft)' : 'var(--bg-card)',
              borderColor: is3D
                ? 'color-mix(in srgb, var(--accent-primary) 24%, transparent)'
                : 'var(--border-primary)',
            }}
          >
            <Activity size={14} className={is3D ? 'animate-pulse' : ''} />
            {is3D ? 'Vista 3D activa' : 'Activar vista 3D'}
          </button>
        </div>

        <div style={{ background: 'var(--bg-primary)' }}>
          {isMapLoading ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4">
              <div
                className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: 'var(--border-strong)',
                  borderTopColor: 'var(--accent-primary)',
                }}
              />
              <span className="section-subtitle">Cargando topología</span>
            </div>
          ) : (
<MapaRacks
              data={rackMapData || []}
              embarcacionesLibres={embarcacionesLibres}
              onAsignar={handleAsignarBarco}
              onRegistrarSalida={handleRegistrarSalida}
              is3D={is3D}
            />
          )}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bento-card overflow-hidden shadow-premium"
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div>
            <div className="section-title">Movimientos de hoy</div>
            <div className="section-subtitle mt-1">Entradas y salidas registradas</div>
          </div>

          <span className="badge badge-neutral">
            {movimientosHoy.length} registros
          </span>
        </div>

        {movimientosHoy.length === 0 ? (
          <div className="py-14 text-center">
            <Activity
              size={24}
              className="mx-auto mb-3"
              style={{ color: 'var(--text-muted)', opacity: 0.35 }}
            />
            <p className="text-ui-sm" style={{ color: 'var(--text-muted)' }}>
              Sin movimientos hoy
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {movimientosHoy.slice(0, 8).map((m) => {
              const esEntrada = m.tipo === TipoMovimiento.ENTRADA;

              return (
                <div key={m.id} className="log-item">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: esEntrada
                            ? 'var(--accent-teal-soft)'
                            : 'var(--accent-purple-soft)',
                        }}
                      >
                        <ArrowUpRight
                          size={15}
                          style={{
                            color: esEntrada ? 'var(--accent-teal)' : 'var(--accent-purple)',
                            transform: esEntrada ? 'none' : 'rotate(180deg)',
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="log-item-title truncate">
                          {m.embarcacion?.nombre || 'Embarcación'}
                        </p>
                        <p className="log-item-text mt-1">
                          {esEntrada ? 'Entrada a cuna' : 'Salida al agua'}
                        </p>
                      </div>
                    </div>

                    <span className="log-item-meta shrink-0">
                      {new Date(m.fecha).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default DashboardOperativo;