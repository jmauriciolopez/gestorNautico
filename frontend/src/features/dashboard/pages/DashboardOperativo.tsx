import React, { useState } from 'react';
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
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const MetricCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'teal' | 'purple' | 'amber';
}) => (
  <div className={`bento-card bento-metric accent-${accent} p-5`}>
    <div className={`bento-icon accent-${accent}`}>{icon}</div>
    <div className="kpi-value mt-1">{value}</div>
    <div className="section-subtitle mt-2">{label}</div>
  </div>
);

const DashboardOperativo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [is3D, setIs3D] = useState(false);

  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const { getMovimientos } = useOperaciones();

  const embarcaciones = getEmbarcaciones.data || [];
  const movimientos = getMovimientos.data || [];

  const enCuna = embarcaciones.filter((e) => e.estado === 'EN_CUNA').length;
  const enAgua = embarcaciones.filter((e) => e.estado === 'EN_AGUA').length;
  const libres = embarcaciones.filter(
    (e) => !e.espacioId && e.estado !== 'INACTIVA'
  ).length;

  const movimientosHoy = movimientos.filter((m) => {
    const fecha = new Date(m.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  });

  const handleAsignarBarco = async (
    embarcacionId: number,
    espacioId: number
  ) => {
    try {
      await updateEmbarcacion.mutateAsync({ id: embarcacionId, data: { espacioId } });
      toast.success('Embarcación asignada');
    } catch (error: any) {
      console.error('Error al asignar:', error);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <section className="bento-card p-6 relative overflow-hidden">
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]"
        >
          <Navigation className="w-28 h-28" style={{ color: 'var(--accent-teal)' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: 'var(--accent-teal)' }}
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-teal)' }}
                />
              </span>
              <span className="section-subtitle" style={{ color: 'var(--accent-teal)' }}>
                Turno activo
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Hola, {user?.nombre}
            </h1>

            <p className="text-ui-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/operaciones')}
              className="btn btn-primary"
            >
              <Navigation size={15} />
              Nueva operación
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          accent="amber"
          label="En cuna"
          value={enCuna}
          icon={<Anchor size={16} style={{ color: 'var(--accent-amber)' }} />}
        />
        <MetricCard
          accent="purple"
          label="En agua"
          value={enAgua}
          icon={<Ship size={16} style={{ color: 'var(--accent-purple)' }} />}
        />
        <MetricCard
          accent="teal"
          label="Sin ubicar"
          value={libres}
          icon={<MapPin size={16} style={{ color: 'var(--accent-teal)' }} />}
        />
      </section>

      <section className="bento-card overflow-hidden">
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
              embarcacionesLibres={embarcaciones.filter(
                (e) => !e.espacioId && e.estado !== 'INACTIVA'
              )}
              onAsignar={handleAsignarBarco}
              is3D={is3D}
            />
          )}
        </div>
      </section>

      <section className="bento-card overflow-hidden">
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
              const esEntrada = m.tipo === 'entrada';

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
      </section>
    </div>
  );
};

export default DashboardOperativo;