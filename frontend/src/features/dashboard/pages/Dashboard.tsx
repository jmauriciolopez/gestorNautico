import React from 'react';
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
  CreditCard
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useDashboard, useRackMap } from '../hooks/useDashboard';
import { MapaRacks } from '../components/MapaRacks';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { useTheme } from '../../../context/ThemeContext';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { useQueryClient } from '@tanstack/react-query';
import { RegistrarPagoModal } from '../../finanzas/components/RegistrarPagoModal';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useDashboard();
  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const queryClient = useQueryClient();
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  useTheme();
  const navigate = useNavigate();

  const embarcaciones = getEmbarcaciones.data || [];
  const embarcacionesLibres = embarcaciones.filter((e: any) => !e.espacioId && e.estado !== 'INACTIVA');

  const handleAsignarBarco = async (embarcacionId: number, espacioId: number) => {
    try {
      await updateEmbarcacion.mutateAsync({
        id: embarcacionId,
        data: { espacioId }
      });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Embarcación asignada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar la embarcación');
      console.error('Error al asignar barco desde dashboard:', error.message);
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError) return (
    <div className="p-8 min-h-[400px] flex items-center justify-center bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--border-primary)]">
      <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl text-center shadow-xl">
        <h2 className="text-rose-500 font-black text-xl mb-2 uppercase tracking-tight">Error de Conexión</h2>
        <p className="text-rose-400/60 text-xs font-bold uppercase tracking-widest">No se pudo recuperar la información del servidor.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-rose-600 text-[var(--text-primary)] rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
        >
          Reintentar Sincronización
        </button>
      </div>
    </div>
  );

  const stats = data?.stats;

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--bg-secondary)]/[0.3] p-8 rounded-[2.5rem] border border-[var(--border-primary)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <Activity className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Habilitación Operativa Online</span>
          </div>
          <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Panel de Control</h1>
          <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2">Visión integral de infraestructura y activos náuticos.</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden lg:block text-right pr-6 border-r border-[var(--border-primary)]">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Última Auditoría en Vivo</p>
            <p className="text-sm font-black text-indigo-500 tabular-nums">{new Date().toLocaleTimeString()}</p>
          </div>
          <button
            onClick={() => setIsPagoModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/30 transition-all active:scale-95 flex items-center gap-3 group/btn"
          >
            <CreditCard className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Registrar Pago
          </button>
          <button
            onClick={() => navigate('/operaciones')}
            className="bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/30 transition-all active:scale-95 flex items-center gap-3 group/btn"
          >
            <PlusCircle className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
            Nueva Operación
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cartera Global de Clientes"
          value={stats?.totalClientes ?? 0}
          icon={<Users className="w-6 h-6" />}
          trend="+3.2%"
          trendUp={true}
          description="Unidades de negocio activas"
          color="text-blue-500"
        />
        <StatCard
          title="Flota Estacionaria"
          value={stats?.totalBarcos ?? 0}
          icon={<Ship className="w-6 h-6" />}
          subValue={`${stats?.ocupacion?.enAgua ?? 0} A-Flote • ${stats?.ocupacion?.enCuna ?? 0} Guardados`}
          color="text-indigo-500"
        />
        <StatCard
          title="Recaudación Auditada"
          value={`$${(stats?.finanzas?.recaudacionTotal ?? 0).toLocaleString()}`}
          icon={<Wallet className="w-6 h-6" />}
          trend="+12.5%"
          trendUp={true}
          color="text-emerald-500"
        />
        <StatCard
          title="Cuentas por Cobrar"
          value={`$${(stats?.finanzas?.deudaTotal ?? 0).toLocaleString()}`}
          icon={<ClipboardList className="w-6 h-6" />}
          trend="-0.8%"
          trendUp={false}
          color="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative bg-[var(--bg-surface)] backdrop-blur-xl p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl h-full transition-colors duration-300">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Rendimiento Financiero</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Histórico de recaudación semanal auditada (ARS)</p>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-black rounded-xl border border-indigo-500/20 uppercase tracking-widest">Live Spectrum</span>
              </div>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.graficos.finanzas}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} strokeOpacity={0.4} />
                  <XAxis
                    dataKey="mes"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    fontWeight="900"
                    tickLine={false}
                    axisLine={false}
                    dy={15}
                    textAnchor="middle"
                    className="uppercase tracking-widest"
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={9}
                    fontWeight="900"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}K`}
                    dx={-15}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--accent-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '20px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                      padding: '16px'
                    }}
                    itemStyle={{ color: 'var(--accent-primary)', fontWeight: '900', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="monto"
                    stroke="var(--accent-primary)"
                    strokeWidth={5}
                    fillOpacity={1}
                    fill="url(#colorMonto)"
                    animationDuration={2500}
                    activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--accent-primary)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity & Notifications feed */}
        <div className="bg-[var(--bg-surface)] backdrop-blur-xl p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3 leading-none">
              <Activity className="w-6 h-6 text-indigo-500" />
              Situación en Vivo
            </h3>
            <div className="flex p-1.5 bg-[var(--bg-secondary)]/[0.2] border border-[var(--border-primary)] rounded-xl">
              <Settings className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-3 custom-scrollbar max-h-[420px]">
            {(data?.notificacionesRecientes?.length ?? 0) > 0 ? (
              data?.notificacionesRecientes.map((notif: any, idx: number) => (
                <div
                  key={idx}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-[var(--bg-primary)]/40 hover:bg-indigo-600/5 border border-transparent hover:border-indigo-500/20 transition-all cursor-default"
                >
                  <div className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center shrink-0 border transition-all duration-500 ${notif.tipo === 'INFO' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      notif.tipo === 'ALERTA' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                    <Activity className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1">{notif.titulo}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold leading-relaxed line-clamp-2">{notif.mensaje}</p>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase mt-2.5 tracking-widest">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • SYSTEM_LOG</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-20">
                <ClipboardList className="w-12 h-12 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cero alertas detectadas</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/operaciones')}
            className="mt-8 w-full py-4 text-[10px] font-black text-[var(--text-secondary)] hover:text-indigo-500 bg-[var(--bg-primary)]/40 hover:bg-white/5 border border-[var(--border-primary)] hover:border-indigo-500/40 rounded-2xl transition-all uppercase tracking-[0.2em]"
          >
            Ver Historial de Auditoría
          </button>
        </div>
      </div>

      {/* Infrastructure Map Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[var(--bg-secondary)]/[0.3] p-8 rounded-[2.5rem] border border-[var(--border-primary)]">
          <div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">Inventario de Infraestructura</h3>
            <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2 ml-0.5">Mapeo topológico de espacios y racks en guarda.</p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--bg-primary)]/40 px-6 py-3 rounded-2xl border border-[var(--border-primary)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Estado Nominal</span>
            </div>
          </div>
        </div>

        <div className="min-h-[450px] relative">
          {isMapLoading ? (
            <div className="bg-[var(--bg-primary)]/20 h-[450px] rounded-[3rem] border-2 border-dashed border-[var(--border-primary)] flex flex-col items-center justify-center gap-6 text-[var(--text-muted)]">
              <div className="w-14 h-14 border-4 border-[var(--border-primary)] border-t-indigo-500 rounded-full animate-spin shadow-2xl shadow-indigo-900/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Topología de Guarda...</span>
            </div>
          ) : (
            <MapaRacks 
              data={rackMapData || []} 
              embarcacionesLibres={embarcacionesLibres}
              onAsignar={handleAsignarBarco}
            />
          )}
        </div>
      </section>

      <div className="h-20" /> {/* Spacer */}
    </div>

    <RegistrarPagoModal 
      isOpen={isPagoModalOpen}
      onClose={() => setIsPagoModalOpen(false)}
    />
  </>
);
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon, subValue, trend, trendUp, color = "text-indigo-500", description
}) => {
  return (
    <div className="relative group overflow-hidden">
      <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
      <div className="relative bg-[var(--bg-surface)] backdrop-blur-xl p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-xl group hover:border-indigo-500/30 transition-all duration-500">
        <div className="flex justify-between items-start mb-8">
          <div className={`p-4 rounded-[1.25rem] bg-[var(--bg-primary)]/60 border border-[var(--border-primary)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-lg ${color}`}>
            {icon}
          </div>
          {trend && (
            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black border flex items-center gap-1.5 transition-all duration-300 ${trendUp ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
              }`}>
              {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.25em] leading-none mb-1">{title}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-[2.25rem] font-black text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">{value}</span>
          </div>
          {subValue ? (
            <p className="text-[10px] font-black text-[var(--text-secondary)] mt-4 pt-4 border-t border-[var(--border-primary)] uppercase tracking-widest">{subValue}</p>
          ) : description ? (
            <p className="text-[10px] font-black text-[var(--text-muted)] mt-4 uppercase tracking-[0.1em]">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
