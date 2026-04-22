import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IngresoReport } from '../hooks/useReportes';
import { TrendingUp, DollarSign, Loader2 } from 'lucide-react';

interface Props {
  data?: IngresoReport[];
  isLoading: boolean;
}

export const DashboardIngresos = ({ data, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">Auditando flujos de caja históricos...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <DollarSign className="w-12 h-12 text-[var(--text-secondary)] opacity-10 mb-4" />
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">No hay datos de ingresos suficientes para proyectar tendencias.</p>
      </div>
    );
  }

  const totalAcumulado = data.reduce((acc, curr) => acc + curr.total, 0);
  const promedioMensual = totalAcumulado / data.length;

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] rounded-[2rem] p-8">
          <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Flujo de Ingresos Mensuales
          </h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-primary)',
                    borderRadius: '1rem',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-10">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Total Recaudado</span>
            <span className="text-4xl font-black text-emerald-500 tabular-nums">
              ${totalAcumulado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
            <div className="mt-4 flex items-center gap-2 text-[var(--text-secondary)]">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Base de pagos liquidados</span>
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] p-10">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Promedio Mensual</span>
            <span className="text-4xl font-black text-indigo-500 tabular-nums">
              ${promedioMensual.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] rounded-[2rem] p-8">
             <h5 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Nota Técnica</h5>
             <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed italic">
               "Los datos reflejan exclusivamente pagos confirmados en caja. No incluyen cargos pendientes de cobro."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
