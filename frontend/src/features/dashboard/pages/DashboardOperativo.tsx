import React, { useState } from 'react';
import { Ship, Navigation, Activity, MapPin, ArrowUpRight, Anchor } from 'lucide-react';
import { useRackMap } from '../hooks/useDashboard';
import { MapaRacks } from '../components/MapaRacks';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { useOperaciones } from '../../operaciones/hooks/useOperaciones';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DashboardOperativo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [is3D, setIs3D] = useState(false);

  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const { getMovimientos } = useOperaciones();

  const embarcaciones = getEmbarcaciones.data || [];
  const movimientos = getMovimientos.data || [];

  const enCuna = embarcaciones.filter(e => e.estado === 'EN_CUNA').length;
  const enAgua = embarcaciones.filter(e => e.estado === 'EN_AGUA').length;
  const libres = embarcaciones.filter(e => !e.espacioId && e.estado !== 'INACTIVA').length;

  const movimientosHoy = movimientos.filter(m => {
    const fecha = new Date(m.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  });

  const handleAsignarBarco = async (embarcacionId: number, espacioId: number) => {
    try {
      await updateEmbarcacion.mutateAsync({ id: embarcacionId, data: { espacioId } });
      toast.success('Embarcación asignada');
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar');
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="bento-card p-5 flex items-center justify-between">
        <div>
          {/* Indicador turno activo */}
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: 'var(--accent-teal)' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--accent-teal)' }} />
            </span>
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--accent-teal)' }}
            >
              Turno activo
            </span>
          </div>

          <h1 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Hola, {user?.nombre}
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>

        <button
          onClick={() => navigate('/operaciones')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #534AB7, #3C3489)',
            color: '#EEEDFE',
          }}
        >
          <Navigation size={13} />
          Nueva operación
        </button>
      </div>

      {/* ── STATS RÁPIDAS ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">

        {/* En Cuna */}
        <div className="bento-card bento-metric accent-amber p-4 flex flex-col gap-2">
          <div className="bento-icon accent-amber">
            <Anchor size={15} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <span className="text-2xl font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
            {enCuna}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            En cuna
          </span>
        </div>

        {/* En Agua */}
        <div className="bento-card bento-metric accent-purple p-4 flex flex-col gap-2">
          <div className="bento-icon accent-purple">
            <Ship size={15} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <span className="text-2xl font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
            {enAgua}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            En agua
          </span>
        </div>

        {/* Sin Ubicar */}
        <div className="bento-card bento-metric accent-teal p-4 flex flex-col gap-2">
          <div className="bento-icon accent-teal">
            <MapPin size={15} style={{ color: 'var(--accent-teal)' }} />
          </div>
          <span className="text-2xl font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
            {libres}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Sin ubicar
          </span>
        </div>

      </div>

      {/* ── MAPA DE RACKS ──────────────────────────────────────── */}
      <div className="bento-card overflow-hidden">

        {/* Header del mapa */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--text-primary)' }}
          >
            Mapa de espacios
          </span>

          <button
            onClick={() => setIs3D(!is3D)}
            className="text-[10px] font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: is3D
                ? 'linear-gradient(135deg, #534AB7, #3C3489)'
                : 'var(--bg-surface)',
              color: is3D ? '#EEEDFE' : 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            {is3D ? '3D activo' : 'Vista 3D'}
          </button>
        </div>

        {/* Contenido del mapa */}
        <div style={{ background: 'var(--bg-primary)' }}>
          {isMapLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent-purple)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : (
            <MapaRacks
              data={rackMapData || []}
              embarcacionesLibres={embarcaciones.filter(e => !e.espacioId && e.estado !== 'INACTIVA')}
              onAsignar={handleAsignarBarco}
              is3D={is3D}
            />
          )}
        </div>
      </div>

      {/* ── MOVIMIENTOS DEL DÍA ────────────────────────────────── */}
      <div className="bento-card">

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <span
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--text-primary)' }}
          >
            Movimientos de hoy
          </span>
          <span
            className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            {movimientosHoy.length} registros
          </span>
        </div>

        {/* Lista */}
        {movimientosHoy.length === 0 ? (
          <div className="py-10 text-center">
            <Activity
              size={22}
              className="mx-auto mb-2"
              style={{ color: 'var(--text-muted)', opacity: 0.3 }}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sin movimientos hoy
            </p>
          </div>
        ) : (
          <div>
            {movimientosHoy.slice(0, 8).map((m, i) => {
              const esEntrada = m.tipo === 'entrada';
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    borderTop: i > 0 ? '1px solid var(--border-secondary)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Ícono tipo */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: esEntrada
                          ? 'var(--accent-teal-soft)'
                          : 'var(--accent-purple-soft)',
                      }}
                    >
                      <ArrowUpRight
                        size={13}
                        style={{
                          color: esEntrada ? 'var(--accent-teal)' : 'var(--accent-purple)',
                          transform: esEntrada ? 'none' : 'rotate(180deg)',
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {m.embarcacion?.nombre}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {esEntrada ? 'Entrada a cuna' : 'Salida al agua'}
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-mono tabular-nums"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {new Date(m.fecha).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardOperativo;
