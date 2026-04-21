import { useState } from 'react';
import { BarChart2, AlertTriangle, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { useClientesMorosos, useMensualidades } from '../hooks/useReportes';
import { ClientesMorososList } from '../components/ClientesMorososList';
import { MensualidadesTable } from '../components/MensualidadesTable';
import { DashboardGerencial } from '../components/DashboardGerencial';
import { useQueryClient } from '@tanstack/react-query';

type Tab = 'morosos' | 'mensualidades' | 'gerencial';

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('morosos');
  const queryClient = useQueryClient();

  const morosos = useClientesMorosos();
  const mensualidades = useMensualidades();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['reportes'] });
  };

  const tabs = [
    { id: 'morosos' as Tab, label: 'Clientes Morosos', icon: AlertTriangle, count: morosos.data?.length },
    { id: 'mensualidades' as Tab, label: 'Mensualidades', icon: TrendingDown, count: mensualidades.data?.length },
    { id: 'gerencial' as Tab, label: 'Dashboard Gerencial', icon: BarChart2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--bg-secondary)]/[0.3] p-8 rounded-[2.5rem] border border-[var(--border-primary)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <BarChart2 className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
          </div>
          <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Reportes</h1>
          <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2">Análisis de morosidad y estructura de mensualidades.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-secondary)]/[0.5] rounded-[2rem] border border-[var(--border-primary)] w-fit shadow-xl">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black rounded-[1.25rem] transition-all uppercase tracking-widest ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === id ? 'bg-white/20 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-surface)] backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">
                {activeTab === 'morosos' ? 'Cartera Morosa' : 
                 activeTab === 'mensualidades' ? 'Cuadro de Mensualidades con Descuentos' : 
                 'Inteligencia de Negocio y Ocupación'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">
                {activeTab === 'morosos'
                  ? 'Clientes con cargos vencidos sin pagar'
                  : activeTab === 'mensualidades'
                  ? 'Tarifa base → descuentos → valor final por embarcación'
                  : 'Análisis de rentabilidad histórica y métricas de ocupación avanzada'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
          </div>
        </div>

        {activeTab === 'morosos' && (
          <ClientesMorososList data={morosos.data ?? []} isLoading={morosos.isLoading} />
        )}
        {activeTab === 'mensualidades' && (
          <MensualidadesTable data={mensualidades.data ?? []} isLoading={mensualidades.isLoading} />
        )}
        {activeTab === 'gerencial' && (
          <DashboardGerencial />
        )}
      </div>
    </div>
  );
}
