import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, PieChart, Pie, Cell } from 'recharts';
import { useOccupancyMetrics, useProfitabilityHistory } from '../hooks/useReportes';
import { Ship, DollarSign, TrendingUp, Users, PieChart as PieIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardGerencial() {
  const { data: occupancy, isLoading: loadingOcc } = useOccupancyMetrics();
  const { data: revenue, isLoading: loadingRev } = useProfitabilityHistory();

  if (loadingOcc || loadingRev) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Cargando métricas avanzadas...</p>
        </div>
      </div>
    );
  }

  const global = occupancy?.global || { totalEspacios: 0, ocupados: 0, libres: 0, porcentajeOcupacion: 0, metrosLinealesOcupados: 0 };
  const pieData = [
    { name: 'Ocupado', value: global.ocupados },
    { name: 'Libre', value: global.libres }
  ];

  const cards = [
    { label: 'Ocupación Total', value: `${global.porcentajeOcupacion.toFixed(1)}%`, icon: Ship, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Metros Ocupados', value: `${global.metrosLinealesOcupados}m`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Facturación Mes', value: `$${revenue?.[revenue.length - 1]?.total?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Crecimiento Trend', value: '+12%', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="p-8 space-y-12">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full -mr-8 -mt-8 opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-2xl font-black text-[var(--text-primary)]">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center border border-white/5 shadow-inner`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] p-8 rounded-[2.5rem] space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Rentabilidad Histórica</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Facturación mensual por categoría</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} 
                  tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="AMARRE" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="SERVICIOS" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Occupancy Split */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] p-8 rounded-[2.5rem] space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Distribución de Ocupación</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Uso de espacios en tiempo real</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {occupancy?.porZona?.map((z: any, idx: number) => (
                <div key={z.zona} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[var(--text-secondary)]">{z.zona}</span>
                    <span className="text-[var(--text-primary)]">{z.porcentaje.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${z.porcentaje}%` }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rack Occupancy Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] p-8 rounded-[2.5rem] shadow-xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Análisis de Capacidad por Zona</h4>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Espacios ocupados vs totales por ubicación</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancy?.porZona}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="zona" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
              />
              <Bar dataKey="total" fill="rgba(255,255,255,0.05)" radius={[10, 10, 0, 0]} barSize={40} />
              <Bar dataKey="ocupados" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
