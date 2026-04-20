import React, { useMemo, useState } from 'react';
import {
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Ship,
  ClipboardList,
  Wallet,
  Settings,
  CreditCard,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  useDashboard,
  useRackMap,
  useRecaudacion,
  useDeuda,
  type PeriodoRecaudacion,
  type PeriodoDeuda,
} from '../hooks/useDashboard';
import { MapaRacks } from '../components/MapaRacks';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { useQueryClient } from '@tanstack/react-query';
import { RegistrarPagoModal } from '../../finanzas/components/RegistrarPagoModal';
import { toast } from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  description?: React.ReactNode;
  accent?: 'teal' | 'purple' | 'amber' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subValue,
  trend,
  trendUp,
  description,
  accent = 'purple',
}) => {
  return (
    <div className={`bento-card bento-metric accent-${accent} p-5`}>
      {trend && (
        <span className={`bento-badge ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </span>
      )}

      <div className={`bento-icon accent-${accent}`}>{icon}</div>

      <p className="section-subtitle mb-2">{title}</p>

      <p className="kpi-value tabular-nums">{value}</p>

      {(subValue || description) && (
        <div
          className="mt-4 pt-3 text-ui-sm"
          style={{
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-secondary)',
          }}
        >
          {subValue ?? description}
        </div>
      )}
    </div>
  );
};

const notifAccent: Record<string, string> = {
  INFO: 'var(--accent-purple-soft)',
  ALERTA: 'var(--accent-amber-soft)',
  OK: 'var(--accent-teal-soft)',
};

const notifColor: Record<string, string> = {
  INFO: 'var(--accent-purple)',
  ALERTA: 'var(--accent-amber)',
  OK: 'var(--accent-teal)',
};

const ToggleChip = ({
  active,
  label,
  onClick,
  tone = 'neutral',
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: 'amber' | 'red' | 'neutral';
}) => {
  const activeStyles =
    tone === 'amber'
      ? {
          background: 'var(--accent-amber-soft)',
          color: 'var(--accent-amber)',
          border: '1px solid color-mix(in srgb, var(--accent-amber) 18%, transparent)',
        }
      : tone === 'red'
        ? {
            background: 'var(--accent-red-soft)',
            color: 'var(--accent-red)',
            border: '1px solid color-mix(in srgb, var(--accent-red) 18%, transparent)',
          }
        : {
            background: 'var(--accent-primary-soft)',
            color: 'var(--accent-primary)',
            border: '1px solid color-mix(in srgb, var(--accent-primary) 18%, transparent)',
          };

  return (
    <button
      onClick={onClick}
      className="badge transition-all"
      style={
        active
          ? activeStyles
          : {
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-secondary)',
            }
      }
    >
      {label}
    </button>
  );
};

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useDashboard();
  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [periodoRecaudacion, setPeriodoRecaudacion] = useState<PeriodoRecaudacion>('mes');
  const [periodoDeuda, setPeriodoDeuda] = useState<PeriodoDeuda>('mes');

  const { data: recaudacionData } = useRecaudacion(periodoRecaudacion);
  const { data: deudaData } = useDeuda(periodoDeuda);

  const embarcaciones = getEmbarcaciones.data || [];
  const embarcacionesLibres = useMemo(
    () => embarcaciones.filter((e: any) => !e.espacioId && e.estado !== 'INACTIVA'),
    [embarcaciones]
  );

  const handleAsignarBarco = async (embarcacionId: number, espacioId: number) => {
    try {
      await updateEmbarcacion.mutateAsync({ id: embarcacionId, data: { espacioId } });
      toast.success('Embarcación asignada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar la embarcación');
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="bento-card p-10 min-h-[420px] flex items-center justify-center">
        <div
          className="rounded-[20px] p-8 text-center max-w-md w-full"
          style={{
            background: 'var(--accent-red-soft)',
            border: '1px solid color-mix(in srgb, var(--accent-red) 18%, transparent)',
          }}
        >
          <h2
            className="text-ui-lg font-bold mb-2"
            style={{ color: 'var(--accent-red)' }}
          >
            Error de conexión
          </h2>
          <p className="text-ui-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            No se pudo recuperar la información del servidor.
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
            className="btn btn-primary"
            style={{ background: 'var(--accent-red)' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER */}
        <header className="bento-card p-6 md:p-7 relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04] hidden lg:block">
            <Activity className="w-36 h-36" style={{ color: 'var(--accent-purple)' }} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
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
              </div>

              <h1
                className="text-[28px] md:text-[32px] font-bold leading-none tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Panel de control
              </h1>

              <p className="text-ui-base mt-3 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                Vista integral de infraestructura, flota, recaudación y actividad operativa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={() => setIsPagoModalOpen(true)}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                  color: '#E1F5EE',
                }}
              >
                <CreditCard size={15} />
                Registrar pago
              </button>

              <button
                onClick={() => navigate('/operaciones')}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #534AB7, #3C3489)',
                  color: '#EEEDFE',
                }}
              >
                <PlusCircle size={15} />
                Nueva operación
              </button>
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            accent="teal"
            title="Cartera global de clientes"
            value={stats?.totalClientes ?? 0}
            icon={<Users size={18} style={{ color: 'var(--accent-teal)' }} />}
            description="Unidades de negocio activas"
          />

          <StatCard
            accent="purple"
            title="Flota estacionaria"
            value={stats?.totalBarcos ?? 0}
            icon={<Ship size={18} style={{ color: 'var(--accent-purple)' }} />}
            subValue={`${stats?.ocupacion?.enAgua ?? 0} a flote · ${stats?.ocupacion?.enCuna ?? 0} guardados`}
          />

          <StatCard
            accent="amber"
            title="Recaudación"
            value={`${(recaudacionData?.total ?? 0).toLocaleString()}`}
            icon={<Wallet size={18} style={{ color: 'var(--accent-amber)' }} />}
            description={
              <div className="flex flex-wrap gap-2">
                {(['dia', 'semana', 'mes'] as PeriodoRecaudacion[]).map((p) => (
                  <ToggleChip
                    key={p}
                    label={p === 'dia' ? 'Hoy' : p === 'semana' ? 'Semana' : 'Mes'}
                    active={periodoRecaudacion === p}
                    onClick={() => setPeriodoRecaudacion(p)}
                    tone="amber"
                  />
                ))}
              </div>
            }
          />

          <StatCard
            accent="red"
            title="Cuentas por cobrar"
            value={`${(deudaData?.total ?? 0).toLocaleString()}`}
            icon={<ClipboardList size={18} style={{ color: 'var(--accent-red)' }} />}
            description={
              <div className="flex flex-wrap gap-2">
                {(['dia', 'semana', 'mes', 'vencido'] as PeriodoDeuda[]).map((p) => (
                  <ToggleChip
                    key={p}
                    label={
                      p === 'dia'
                        ? 'Hoy'
                        : p === 'semana'
                          ? 'Semana'
                          : p === 'mes'
                            ? 'Mes'
                            : 'Vencido'
                    }
                    active={periodoDeuda === p}
                    onClick={() => setPeriodoDeuda(p)}
                    tone="red"
                  />
                ))}
              </div>
            }
          />
        </div>

        {/* CHART + ACTIVITY */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bento-card p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <p className="section-title">Rendimiento financiero</p>
                <p className="text-ui-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Evolución de recaudación auditada.
                </p>
              </div>

              <span className="badge badge-info">ARS</span>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.graficos.finanzas}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-primary)"
                    vertical={false}
                    strokeOpacity={0.5}
                  />

                  <XAxis
                    dataKey="mes"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />

                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}K`}
                    dx={-8}
                  />

                  <Tooltip
                    cursor={{
                      stroke: 'var(--accent-teal)',
                      strokeWidth: 1,
                      strokeDasharray: '4 4',
                    }}
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      boxShadow: 'var(--shadow-md)',
                    }}
                    itemStyle={{
                      color: 'var(--accent-teal)',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                    labelStyle={{
                      color: 'var(--text-secondary)',
                      fontSize: 11,
                      marginBottom: 6,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="monto"
                    stroke="var(--accent-teal)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMonto)"
                    animationDuration={1200}
                    activeDot={{
                      r: 5,
                      strokeWidth: 0,
                      fill: 'var(--accent-teal)',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
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
                  <h3 className="section-title">Situación en vivo</h3>
                </div>
                <p className="text-ui-sm" style={{ color: 'var(--text-secondary)' }}>
                  Eventos y alertas recientes
                </p>
              </div>

              <button
                onClick={() => navigate('/configuracion')}
                className="icon-button"
                title="Configuración"
              >
                <Settings size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-[340px] pr-1">
              {(data?.notificacionesRecientes?.length ?? 0) > 0 ? (
                data?.notificacionesRecientes.map((notif: any, idx: number) => (
                  <div key={idx} className="log-item">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: notifAccent[notif.tipo] ?? notifAccent.INFO }}
                      >
                        <Activity
                          size={14}
                          style={{ color: notifColor[notif.tipo] ?? notifColor.INFO }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="log-item-title">{notif.titulo}</p>
                        <p className="log-item-text mt-1">{notif.mensaje}</p>
                        <p className="log-item-meta mt-2">
                          · {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center opacity-70">
                  <ClipboardList
                    size={26}
                    className="mx-auto mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <p className="text-ui-sm" style={{ color: 'var(--text-muted)' }}>
                    No hay alertas recientes.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/operaciones')}
              className="btn btn-secondary mt-4 w-full"
            >
              Ver historial de auditoría
            </button>
          </div>
        </div>

        {/* MAPA */}
        <section className="space-y-4">
          <div className="bento-card p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="section-title">Inventario de infraestructura</p>
              <p className="text-ui-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Mapeo topológico de espacios y racks en guarda.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIs3D(!is3D)}
                className="btn btn-secondary"
                style={
                  is3D
                    ? {
                        background: 'linear-gradient(135deg, #534AB7, #3C3489)',
                        color: '#EEEDFE',
                        borderColor: 'transparent',
                      }
                    : undefined
                }
              >
                <Activity size={14} className={is3D ? 'animate-pulse' : ''} />
                Vista 3D {is3D ? 'activa' : 'inactiva'}
              </button>
            </div>
          </div>

          <div className="min-h-[460px] relative">
            {isMapLoading ? (
              <div
                className="h-[460px] rounded-[20px] flex flex-col items-center justify-center gap-5"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-primary)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: 'var(--border-primary)',
                    borderTopColor: 'var(--accent-purple)',
                  }}
                />
                <span className="section-subtitle">Sincronizando topología...</span>
              </div>
            ) : (
              <MapaRacks
                data={rackMapData || []}
                embarcacionesLibres={embarcacionesLibres}
                onAsignar={handleAsignarBarco}
                is3D={is3D}
              />
            )}
          </div>
        </section>

        <div className="h-8" />
      </div>

      <RegistrarPagoModal
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;