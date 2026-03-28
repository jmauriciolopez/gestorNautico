import React from 'react';
import { 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Ship,
  ClipboardList,
  Wallet
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

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useDashboard();
  const { data: rackMapData, isLoading: isMapLoading } = useRackMap();
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;
  
  if (isError) return (
    <div className="p-8 h-screen flex items-center justify-center bg-[#020617]">
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
        <h2 className="text-red-400 font-bold text-lg mb-2">Error de Conexión</h2>
        <p className="text-red-400/60 text-sm">No se pudo recuperar la información del servidor.</p>
      </div>
    </div>
  );

  const stats = data?.stats;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-1000">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Sistema Operativo Online</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Panel de Gestión</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Control integral de la flota e infraestructura náutica.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden lg:block text-right mr-4 border-r border-slate-800 pr-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Última Sincronización</p>
                <p className="text-xs font-mono text-blue-400">{new Date().toLocaleTimeString()}</p>
            </div>
            <button 
                onClick={() => navigate('/operaciones')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2 group"
            >
                <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Nueva Operación
            </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Cartera de Clientes" 
          value={stats?.totalClientes ?? 0} 
          icon={<Users className="w-6 h-6" />}
          trend="+3.2%"
          trendUp={true}
          description="Usuarios activos registrados"
        />
        <StatCard 
          title="Embarcaciones" 
          value={stats?.totalBarcos ?? 0} 
          icon={<Ship className="w-6 h-6" />}
          subValue={`${stats?.ocupacion?.enAgua ?? 0} a flote • ${stats?.ocupacion?.enCuna ?? 0} en guarda`}
          color="text-indigo-400"
        />
        <StatCard 
          title="Caja Total" 
          value={`$${(stats?.finanzas?.recaudacionTotal ?? 0).toLocaleString()}`} 
          icon={<Wallet className="w-6 h-6" />}
          trend="+12.5%"
          trendUp={true}
          color="text-emerald-400"
        />
        <StatCard 
          title="Cobros Pendientes" 
          value={`$${(stats?.finanzas?.deudaTotal ?? 0).toLocaleString()}`} 
          icon={<ClipboardList className="w-6 h-6" />}
          trend="-0.8%"
          trendUp={false}
          color="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/60 shadow-2xl h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white">Rendimiento Financiero</h3>
                    <p className="text-xs text-slate-500 font-medium">Histórico de recaudación semanal (ARS)</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-lg">LIVE VIEW</span>
                </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.graficos.finanzas}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#475569" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value/1000}k`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#020617', 
                        border: '1px solid #1e293b', 
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="monto" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorMonto)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Real-time Activity feed */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/60 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Bitácora Operativa
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 bg-slate-800 rounded">RECIENTES</span>
          </div>
          
          <div className="space-y-4 flex-1">
            {data?.actividadReciente?.map((mov: any, idx: number) => (
              <div 
                key={idx} 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    mov.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <Ship className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{mov.embarcacion?.nombre || 'Barco Desconocido'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{mov.tipo} • {new Date(mov.fecha).toLocaleDateString()}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/operaciones')}
            className="mt-6 w-full py-3 text-xs font-bold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 rounded-xl transition-all"
          >
            Ver Historial Completo
          </button>
        </div>
      </div>

      {/* Infrastructure Map Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
            <div>
                <h3 className="text-2xl font-black text-white tracking-tighter">Inventario de Espacios</h3>
                <p className="text-slate-500 text-sm font-medium">Estado técnico de la infraestructura portuaria.</p>
            </div>
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Activo</span>
                </div>
            </div>
        </div>

        <div className="min-h-[400px]">
          {isMapLoading ? (
              <div className="bg-slate-900/20 h-[400px] rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-600">
                  <div className="w-10 h-10 border-4 border-slate-800 border-t-slate-500 rounded-full animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Calculando topología...</span>
              </div>
          ) : (
              <MapaRacks data={rackMapData || []} />
          )}
        </div>
      </section>
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
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, value, icon, subValue, trend, trendUp, color = "text-blue-400", description 
}) => (
  <div className="relative group perspective-1000">
    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-0 group-hover:opacity-15 transition-opacity duration-500" />
    <div className="relative bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/60 shadow-xl group hover:border-slate-700/50 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl bg-slate-800/50 group-hover:scale-110 transition-all duration-500 ring-1 ring-white/5 ${color}`}>
                {icon}
            </div>
            {trend && (
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 ${
                    trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            )}
        </div>
        
        <div className="space-y-1">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</span>
            </div>
            {subValue ? (
                <p className="text-xs font-medium text-slate-400 mt-3 pt-3 border-t border-slate-800/60">{subValue}</p>
            ) : description ? (
                <p className="text-xs font-medium text-slate-500 mt-2">{description}</p>
            ) : null}
        </div>
    </div>
  </div>
);

export default Dashboard;
