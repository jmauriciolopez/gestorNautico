import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { OcupacionReport } from '../hooks/useReportes';
import { LayoutGrid, MapPin, Loader2 } from 'lucide-react';

interface Props {
  data?: OcupacionReport;
  isLoading: boolean;
}

const COLORS = ['#6366f1', '#1e293b']; // Indigo-500, Slate-800

export const DashboardOcupacion = ({ data, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">Calculando ocupación real...</p>
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: 'Ocupados', value: data.ocupados },
    { name: 'Libres', value: data.libres },
  ];

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Chart Card */}
        <div className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] rounded-[2rem] p-8 relative overflow-hidden">
          <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Distribución General
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-primary)',
                    borderRadius: '1rem',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }} 
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] text-center pointer-events-none">
            <span className="block text-3xl font-black text-[var(--text-primary)] leading-none">{data.porcentajeOcupacion.toFixed(1)}%</span>
            <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Ocupado</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] rounded-[2rem] p-8">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Total Espacios</span>
              <span className="text-4xl font-black text-[var(--text-primary)]">{data.total}</span>
            </div>
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">En Uso</span>
              <span className="text-4xl font-black text-indigo-500">{data.ocupados}</span>
            </div>
          </div>

          <div className="bg-[var(--bg-primary)]/30 border border-[var(--border-primary)] rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-primary)]">
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Zona</th>
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-center">Uso</th>
                  <th className="px-6 py-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">Cunas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-secondary)]">
                {data.porZona.map((zona) => (
                  <tr key={zona.nombre} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500/50" />
                        <span className="text-xs font-bold text-[var(--text-primary)]">{zona.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-24 h-1.5 bg-[var(--bg-primary)] rounded-full mx-auto overflow-hidden border border-[var(--border-primary)]">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-1000" 
                          style={{ width: `${zona.porcentaje}%` }} 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-black text-[var(--text-secondary)] tabular-nums">{zona.ocupados}/{zona.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
