import React, { useState } from 'react';
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
import { useDashboard, useRackMap } from '../hooks/useDashboard';
import { MapaRacks } from '../components/MapaRacks';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { useTheme } from '../../../context/ThemeContext';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { useQueryClient } from '@tanstack/react-query';
import { RegistrarPagoModal } from '../../finanzas/components/RegistrarPagoModal';
import { toast } from 'react-hot-toast';

// ─── STAT CARD ────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  accent?: 'teal' | 'purple' | 'amber' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon, subValue, trend, trendUp, description, accent = 'purple',
}) => (
  <div className={`bento-card bento-metric accent-${accent} p-5`}>
    {/* Trend badge */}
    {trend && (
      <span className={`bento-badge ${trendUp ? 'up' : 'down'}`}>
        {trendUp
          ? <ArrowUpRight size={10} />
          : <ArrowDownRight size={10} />
        }
        {trend}
      </span>
    )}

    {/* Icon */}
    <div className={`bento-icon accent-${accent} mb-4`}>
      {icon}
    </div>

    {/* Label */}
    <p
      className="text-[10px] font-medium uppercase tracking-widest mb-1.5"
      style={{ color: 'var(--text-muted)' }}
    >
      {title}
    </p>

    {/* Value */}
    <p
      className="text-3xl font-medium leading-none tracking-tight tabular-nums"
      style={{ color: 'var(--text-primary)' }}
    >
      {value}
    </p>

    {/* Sub / description */}
    {(subValue || description) && (
      <p
        className="text-[10px] mt-2 pt-3"
        style={{
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-secondary)',
        }}
      >
        {subValue ?? description}
      </p>
    )}
  </div>
);

// ─── NOTIFICATION ITEM ────────────────────────────────────────────

const notifAccent: Record<string, string> = {
  INFO:   'var(--accent-purple-soft)',
  ALERTA: 'var(--accent-amber-soft)',
  OK:     'var(--accent-teal-soft)',
};
const notifColor: Record<string, string> = {
  INFO:   'var(--accent-purple)',
  ALERTA: 'var(--accent-amber)',
  OK:     'var(--accent-teal)',
};

// ─── DASHBOARD ────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useDashboard();
  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const queryClient = useQueryClient();
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  useTheme();
  const navigate = useNavigate();

  const embarcaciones = getEmbarcaciones.data || [];
  const embarcacionesLibres = embarcaciones.filter(
    (e: any) => !e.espacioId && e.estado !== 'INACTIVA'
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

  if (isError) return (
    <div
      className="bento-card p-10 min-h-[400px] flex items-center justify-center"
    >
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'var(--accent-red-soft)',
          border: '1px solid rgba(226,75,74,0.2)',
        }}
      >
        <h2
          className="text-lg font-medium mb-2 uppercase tracking-tight"
          style={{ color: 'var(--accent-red)' }}
        >
          Error de conexión
        </h2>
        <p
          className="text-xs mb-6 uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          No se pudo recuperar la información del servidor.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
          className="px-6 py-2 rounded-xl text-xs font-medium uppercase tracking-widest transition-all active:scale-95"
          style={{
            background: 'var(--accent-red)',
            color: '#fff',
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  const stats = data?.stats;

  return (
    <>
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <header className="bento-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">

          {/* Watermark */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
            <Activity className="w-32 h-32" style={{ color: 'var(--accent-purple)' }} />
          </div>

          {/* Left */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: 'var(--accent-teal)' }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--accent-teal)' }}
                />
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-[0.25em]"
                style={{ color: 'var(--accent-teal)' }}
              >
                Habilitación operativa online
              </span>
            </div>
            <h1
              className="text-2xl font-medium leading-none tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Panel de control
            </h1>
            <p
              className="text-[11px] mt-1 uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Visión integral de infraestructura y activos náuticos
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Live audit time */}
            <div
              className="hidden lg:flex flex-col items-end pr-4 mr-1"
              style={{ borderRight: '1px solid var(--border-primary)' }}
            >
              <span
                className="text-[9px] font-medium uppercase tracking-widest leading-none mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Última auditoría en vivo
              </span>
              <span
                className="text-sm font-medium tabular-nums"
                style={{ color: 'var(--accent-purple)' }}
              >
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <button
              onClick={() => setIsPagoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                color: '#E1F5EE',
              }}
            >
              <CreditCard size={13} />
              Registrar pago
            </button>

            <button
              onClick={() => navigate('/operaciones')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #534AB7, #3C3489)',
                color: '#EEEDFE',
              }}
            >
              <PlusCircle size={13} />
              Nueva operación
            </button>
          </div>
        </header>

        {/* ── STAT CARDS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            accent="teal"
            title="Cartera global de clientes"
            value={stats?.totalClientes ?? 0}
            icon={<Users size={15} style={{ color: 'var(--accent-teal)' }} />}
            trend="+3.2%"
            trendUp
            description="Unidades de negocio activas"
          />
          <StatCard
            accent="purple"
            title="Flota estacionaria"
            value={stats?.totalBarcos ?? 0}
            icon={<Ship size={15} style={{ color: 'var(--accent-purple)' }} />}
            subValue={`${stats?.ocupacion?.enAgua ?? 0} a flote · ${stats?.ocupacion?.enCuna ?? 0} guardados`}
          />
          <StatCard
            accent="amber"
            title="Recaudación auditada"
            value={`$${(stats?.finanzas?.recaudacionTotal ?? 0).toLocaleString()}`}
            icon={<Wallet size={15} style={{ color: 'var(--accent-amber)' }} />}
            trend="+12.5%"
            trendUp
          />
          <StatCard
            accent="red"
            title="Cuentas por cobrar"
            value={`$${(stats?.finanzas?.deudaTotal ?? 0).toLocaleString()}`}
            icon={<ClipboardList size={15} style={{ color: 'var(--accent-red)' }} />}
            trend="-0.8%"
            trendUp={false}
          />
        </div>

        {/* ── CHART + ACTIVITY ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Chart */}
          <div className="lg:col-span-2 bento-card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Rendimiento financiero
                </p>
                <p
                  className="text-[10px] mt-0.5 uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Histórico de recaudación semanal auditada (ARS)
                </p>
              </div>
              <span
                className="px-3 py-1.5 rounded-xl text-[10px] font-medium"
                style={{
                  background: 'var(--accent-purple-soft)',
                  color: 'var(--accent-purple)',
                }}
              >
                Live spectrum
              </span>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={data?.graficos.finanzas}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.2} />
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
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    className="uppercase tracking-widest"
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}K`}
                    dx={-8}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--accent-teal)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}
                    itemStyle={{ color: 'var(--accent-teal)', fontWeight: 500, fontSize: 12 }}
                    labelStyle={{
                      color: 'var(--text-secondary)',
                      fontSize: 9,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 4,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="monto"
                    stroke="var(--accent-teal)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMonto)"
                    animationDuration={1500}
                    activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent-teal)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity feed */}
          <div className="bento-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{ backgroundColor: 'var(--accent-teal)' }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent-teal)' }}
                  />
                </span>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Situación en vivo
                </h3>
              </div>
              <button
                onClick={() => navigate('/configuracion')}
                className="p-1.5 rounded-lg transition-all hover:opacity-70"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                }}
                title="Configuración"
              >
                <Settings size={13} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[320px] pr-1">
              {(data?.notificacionesRecientes?.length ?? 0) > 0 ? (
                data?.notificacionesRecientes.map((notif: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: notifAccent[notif.tipo] ?? notifAccent.INFO }}
                    >
                      <Activity
                        size={13}
                        style={{ color: notifColor[notif.tipo] ?? notifColor.INFO }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[11px] font-medium leading-snug uppercase tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {notif.titulo}
                      </p>
                      <p
                        className="text-[10px] mt-0.5 leading-relaxed line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {notif.mensaje}
                      </p>
                      <p
                        className="text-[9px] mt-1.5 uppercase tracking-widest font-mono"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit',
                        })} · system_log
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center" style={{ opacity: 0.25 }}>
                  <ClipboardList size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Cero alertas detectadas
                  </p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <button
              onClick={() => navigate('/operaciones')}
              className="mt-4 w-full py-3 rounded-xl text-[10px] font-medium uppercase tracking-widest transition-all hover:opacity-80"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)',
              }}
            >
              Ver historial de auditoría
            </button>
          </div>
        </div>

        {/* ── INFRASTRUCTURE MAP ─────────────────────────────────── */}
        <section className="space-y-3">

          {/* Map header */}
          <div className="bento-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Inventario de infraestructura
              </p>
              <p
                className="text-[10px] mt-0.5 uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Mapeo topológico de espacios y racks en guarda
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Estado nominal */}
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px]"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent-teal)' }}
                />
                Estado nominal
              </div>

              {/* Toggle 3D */}
              <button
                onClick={() => setIs3D(!is3D)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-medium transition-all active:scale-95"
                style={{
                  background: is3D
                    ? 'linear-gradient(135deg, #534AB7, #3C3489)'
                    : 'var(--bg-surface)',
                  color: is3D ? '#EEEDFE' : 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <Activity size={12} className={is3D ? 'animate-pulse' : ''} />
                Vista 3D {is3D ? 'activa' : 'inactiva'}
              </button>
            </div>
          </div>

          {/* Map area */}
          <div className="min-h-[450px] relative">
            {isMapLoading ? (
              <div
                className="h-[450px] rounded-2xl flex flex-col items-center justify-center gap-5"
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
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.25em] animate-pulse"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sincronizando topología de guarda...
                </span>
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

        <div className="h-10" />
      </div>

      <RegistrarPagoModal
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;