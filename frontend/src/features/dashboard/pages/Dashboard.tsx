import React from 'react';
import { 
  Users, 
  Anchor, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
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

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useDashboard();
  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();

  if (isLoading) return <div className="p-8 animate-pulse text-blue-400">Cargando métricas estratégicas...</div>;
  if (isError) return <div className="p-8 text-red-500">Error al cargar el Dashboard.</div>;

  const stats = data?.stats;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Control</h1>
          <p className="text-slate-400 mt-1">Visión general del estado operativo y financiero.</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700/50 text-xs font-mono text-blue-400">
          DATA SYNC: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Clientes Totales" 
          value={stats?.totalClientes || 0} 
          icon={<Users className="w-6 h-6" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="Embarcaciones" 
          value={stats?.totalBarcos || 0} 
          icon={<Anchor className="w-6 h-6" />}
          subValue={`${stats?.ocupacion.enAgua} en agua / ${stats?.ocupacion.enCuna} en cuna`}
        />
        <StatCard 
          title="Recaudación Total" 
          value={`$${stats?.finanzas.recaudacionTotal.toLocaleString()}`} 
          icon={<DollarSign className="w-6 h-6" />}
          trend="+8.2%"
          trendUp={true}
          color="text-emerald-400"
        />
        <StatCard 
          title="Deuda Pendiente" 
          value={`$${stats?.finanzas.deudaTotal.toLocaleString()}`} 
          icon={<TrendingUp className="w-6 h-6" />}
          trend="-2.4%"
          trendUp={false}
          color="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Tendencia de Ingresos</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.graficos.finanzas}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="monto" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMonto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-2xl h-fit">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Movimientos Recientes
          </h3>
          <div className="space-y-4">
            {data?.actividadReclente.map((mov: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-700/50">
                <div className={`p-2 rounded-full ${mov.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  <Anchor className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{mov.embarcacion?.nombre || 'Barco'}</p>
                  <p className="text-xs text-slate-400">{mov.tipo} - {new Date(mov.fecha).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rack Map Section */}
      <div className="pt-8 border-t border-slate-800/50">
        {isMapLoading ? (
            <div className="bg-slate-950/20 p-24 rounded-[3rem] border border-dashed border-slate-800 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Sincronizando topología de racks...</p>
            </div>
        ) : (
            <MapaRacks data={rackMapData || []} />
        )}
      </div>
    </div>
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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subValue, trend, trendUp, color = "text-blue-400" }) => (
  <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl group hover:border-blue-500/30 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`bg-slate-800/50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium flex items-center gap-0.5 px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-slate-400">{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
      </div>
      {subValue && <p className="text-xs text-slate-500 mt-2">{subValue}</p>}
    </div>
  </div>
);

export default Dashboard;
