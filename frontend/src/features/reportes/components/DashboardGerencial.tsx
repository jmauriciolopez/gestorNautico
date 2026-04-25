import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { useOccupancyMetrics, useProfitabilityHistory, useDemandPeaks, useCollectionTime, useARPU, useVIPClients } from '../hooks/useReportes';
import { Ship, TrendingUp, Activity, PieChart as PieIcon, Clock, Award, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const DAYS = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function DashboardGerencial() {
  const { data: occupancy, isLoading: loadingOcc } = useOccupancyMetrics();
  const { data: revenue, isLoading: loadingRev } = useProfitabilityHistory();
  const { data: demandPeaks, isLoading: loadingPeaks } = useDemandPeaks();
  const { data: collectionTime, isLoading: loadingColl } = useCollectionTime();
  const { data: arpuData, isLoading: loadingArpu } = useARPU();
  const { data: vips, isLoading: loadingVips } = useVIPClients();

  if (loadingOcc || loadingRev || loadingPeaks || loadingColl || loadingArpu || loadingVips) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Procesando inteligencia de negocio...</p>
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
    { label: 'Promedio Cobro (DSO)', value: `${collectionTime?.promedioDias || 0} días`, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'ARPU (Rentabilidad/m)', value: `$${arpuData?.arpu || 0}`, icon: Ruler, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Top VIP Facturación', value: vips?.[0]?.nombre?.split(' ')[0] || '-', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Rentabilidad Histórica</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Ingresos de los últimos 12 meses</p>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(0)+'k' : val}`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }} itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="AMARRE" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="SERVICIOS" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Demand Peaks (Scatter/Heatmap) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] p-8 rounded-[2.5rem] space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Picos de Demanda Operativa</h4>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Horarios de mayor tráfico (L-D, 0-23h)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="hora" name="Hora" unit="h" domain={[0, 23]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} />
                <YAxis type="number" dataKey="dia" name="Día" domain={[1, 7]} tickFormatter={(val) => DAYS[val]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} />
                <ZAxis type="number" dataKey="cantidad" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', borderRadius: '1rem', border: 'none' }} />
                <Scatter data={demandPeaks} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Occupancy Split */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] p-8 rounded-[2.5rem] shadow-xl xl:col-span-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <PieIcon className="w-5 h-5 text-emerald-500" />
            <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Uso de Espacios</h4>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {occupancy?.porZona?.map((z: any, idx: number) => (
              <div key={z.zona} className="space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-[var(--text-secondary)]">{z.zona}</span>
                  <span className="text-[var(--text-primary)]">{z.porcentaje.toFixed(0)}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${z.porcentaje}%` }} className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top VIP Clients Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] p-8 rounded-[2.5rem] shadow-xl xl:col-span-2 overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Ranking VIP - Lifetime Value</h4>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Top 10 clientes por facturación total</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="pb-4 pl-2">Cliente</th>
                  <th className="pb-4">Pagos</th>
                  <th className="pb-4 text-right pr-2">Total Invertido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vips?.map((vip: any, idx: number) => (
                  <tr key={vip.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-indigo-500/50 w-4">#{idx + 1}</span>
                        <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">{vip.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[11px] font-bold text-[var(--text-secondary)]">{vip.pagos} op.</td>
                    <td className="py-4 text-right pr-2">
                      <span className="text-[12px] font-black text-emerald-500">${vip.total.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">Capacidad Detallada por Zona</h4>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">Comparativa de espacios ocupados vs. totales</p>
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancy?.porZona}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="zona" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(15, 15, 20, 0.95)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }} itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Bar dataKey="total" fill="rgba(255,255,255,0.05)" radius={[10, 10, 0, 0]} barSize={40} />
              <Bar dataKey="ocupados" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
