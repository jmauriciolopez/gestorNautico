import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIngresos } from '../hooks/useReportes';
import { TrendingUp, DollarSign, Loader2, Calendar, Filter } from 'lucide-react';

export const DashboardIngresos = () => {
  // Inicializar con el último año por defecto
  const [startDate, setStartDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useIngresos({ startDate, endDate });

  const totalAcumulado = data?.reduce((acc, curr) => acc + curr.total, 0) || 0;
  const promedioMensual = data && data.length > 0 ? totalAcumulado / data.length : 0;

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-500">
      {/* Date Filters Bar */}
      <div className="flex flex-wrap items-center gap-6 bg-[var(--bg-primary)]/40 p-6 rounded-3xl border border-[var(--border-primary)] shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Filter className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Filtrar Periodo:</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400 opacity-50" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)]/[0.4] border border-[var(--border-primary)] rounded-xl text-[10px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <span className="text-[var(--text-secondary)] opacity-30 text-xs font-black">→</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400 opacity-50" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)]/[0.4] border border-[var(--border-primary)] rounded-xl text-[10px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {(startDate || endDate) && (
          <button 
            onClick={() => {
              setStartDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest ml-auto"
          >
            Restablecer Histórico
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">Analizando flujos financieros del periodo...</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--bg-primary)]/10 rounded-[3rem] border border-dashed border-[var(--border-primary)]">
          <DollarSign className="w-12 h-12 text-[var(--text-secondary)] opacity-10 mb-4" />
          <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Sin datos para el periodo seleccionado</h4>
          <p className="mt-2 text-[10px] text-[var(--text-muted)] font-medium max-w-xs mx-auto uppercase">Ajusta los filtros para visualizar la evolución de ingresos confirmados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] rounded-[3rem] p-10 relative overflow-hidden group/chart">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover/chart:scale-110 transition-transform duration-1000">
              <TrendingUp className="w-64 h-64 text-indigo-500" />
            </div>
            
            <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-12 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Evolución Mensual de Recaudación
            </h4>
            
            <div className="h-[380px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: '900', letterSpacing: '0.1em' }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: '900' }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '1.25rem',
                      fontSize: '10px',
                      fontWeight: '900',
                      color: '#fff',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, 'Recaudado']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#6366f1" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 rounded-[2.5rem] p-10 shadow-xl shadow-emerald-900/10 transition-transform hover:scale-[1.02] duration-500">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-3">Total del Periodo</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-emerald-500/60 opacity-50">$</span>
                <span className="text-4xl font-black text-emerald-500 tabular-nums tracking-tighter">
                  {totalAcumulado.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="mt-6 pt-6 border-t border-emerald-500/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.15em]">Pagos Liquidados</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-700/5 border border-indigo-500/20 rounded-[2.5rem] p-10 shadow-xl shadow-indigo-900/10 transition-transform hover:scale-[1.02] duration-500">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-3">Media Mensual</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-indigo-500/60 opacity-50">$</span>
                <span className="text-4xl font-black text-indigo-500 tabular-nums tracking-tighter">
                  {promedioMensual.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-[2.5rem] p-10 flex flex-col justify-center gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                 </div>
                 <h5 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Nota de Auditoría</h5>
               </div>
               <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed italic opacity-80">
                 "Este análisis contempla exclusivamente transacciones validadas en el libro de caja dentro del rango de fechas seleccionado."
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
