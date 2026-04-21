import { useState } from 'react';
import { Plus, RefreshCw, Receipt, FileText, Search, FileCheck, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { useFacturasStats } from '../hooks/useFacturas';
import { FacturasList } from '../components/FacturasList';
import { NuevaFacturaModal } from '../components/NuevaFacturaModal';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../hooks/useDebounce';

export default function FacturacionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useFacturasStats(startDate, endDate);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['facturas'] });
  };

  const filters = { search: debouncedSearch, startDate, endDate };

  return (
    <div className="space-y-8 p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-[var(--bg-secondary)]/[0.3] p-4 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-[var(--border-primary)] relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <FileText className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Facturación Centralizada</span>
          </div>
          <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Dashboard Fiscal</h1>
          <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2">Administración de comprobantes y flujo de caja.</p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-4 relative z-10 w-full xl:w-auto">
          <div className="flex-1 min-w-[200px] xl:w-64 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="BUSCAR Nº O CLIENTE..."
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              className="w-full bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl py-3.5 pl-12 pr-4 text-[10px] font-black tracking-widest text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500/50 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl p-1 px-3">
            <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider focus:outline-none py-2"
            />
            <span className="text-[var(--text-muted)] px-1">/</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider focus:outline-none py-2"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="ml-2 text-rose-400 hover:text-rose-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="p-3.5 text-[var(--text-secondary)] hover:text-indigo-400 transition-all bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl hover:border-indigo-500/40 active:scale-90"
            title="Sincronizar Panel"
          >
            <RefreshCw className={`w-5 h-5 ${statsLoading ? 'animate-spin' : ''}`} />
          </button>

          <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-3 group/btn"
            >
              <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
              Nueva Factura
            </button>
          </RoleGuard>
        </div>
      </header>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)] p-8 rounded-[2rem] relative overflow-hidden group hover:bg-[var(--bg-secondary)]/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{stats?.CONTEO_PENDIENTE || 0} comprobantes</span>
          </div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Pendiente de Cobro</p>
          <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
            ${stats?.TOTAL_PENDIENTE?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0,00'}
          </h4>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>

        <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)] p-8 rounded-[2rem] relative overflow-hidden group hover:bg-[var(--bg-secondary)]/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <FileCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{stats?.CONTEO_PAGADO || 0} comprobantes</span>
          </div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Total Recaudado</p>
          <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
            ${stats?.TOTAL_PAGADO?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0,00'}
          </h4>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>

        <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)] p-8 rounded-[2rem] relative overflow-hidden group hover:bg-[var(--bg-secondary)]/50 transition-all lg:col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Receipt className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Saldo Activo</span>
          </div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Compromiso Total</p>
          <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
            ${((stats?.TOTAL_PENDIENTE || 0) + (stats?.TOTAL_PAGADO || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </h4>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
      </div>

      {/* Main Data Grid */}
      <main className="bg-[var(--bg-surface)] backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden transition-colors duration-300 group/grid min-h-[500px]">
        <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] leading-none">
                Registro Maestro de Comprobantes
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">
                Visualizando registros filtrados por criterios activos
              </p>
            </div>
          </div>
          {(search || startDate || endDate) && (
            <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Filtros Activos</span>
            </div>
          )}
        </div>

        <FacturasList filters={filters} />
      </main>

      <NuevaFacturaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
