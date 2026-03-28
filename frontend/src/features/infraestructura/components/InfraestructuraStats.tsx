import { LayoutGrid } from 'lucide-react';

interface InfraestructuraStatsProps {
  stats: {
    total: number;
    ocupados: number;
    libres: number;
    porcentajeOcupacion: number;
  };
}

export function InfraestructuraStats({ stats }: InfraestructuraStatsProps) {
  const { total, ocupados, libres, porcentajeOcupacion } = stats;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <LayoutGrid className="text-blue-500 w-8 h-8" />
          Infraestructura
        </h1>
        <p className="text-slate-300 mt-2 font-medium">Gestión de zonas, racks y espacios de la guardería.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
        <StatCard label="Total" value={total} color="blue" />
        <StatCard label="Ocupados" value={ocupados} color="rose" />
        <StatCard label="Libres" value={libres} color="emerald" />
        <StatCard label="Ocupación" value={`${porcentajeOcupacion.toFixed(1)}%`} color="amber" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: 'blue' | 'rose' | 'emerald' | 'amber' }) {
  const colors = {
    blue: 'border-blue-500/20 text-blue-400 bg-blue-500/5 shadow-blue-500/10',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/5 shadow-rose-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-emerald-500/10',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/5 shadow-amber-500/10',
  };

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-transform hover:scale-105 ${colors[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
