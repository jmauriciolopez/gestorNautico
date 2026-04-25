import React, { useState } from 'react';
import { Wrench, Plus, BookOpen, Activity, LayoutGrid, Layers, Loader2, Search, Filter, Trash2 } from 'lucide-react';
import { useServicios } from '../hooks/useServicios';
import { CatalogoList } from '../components/CatalogoList';
import { RegistrosList } from '../components/RegistrosList';
import { NuevoServicioModal } from '../components/NuevoServicioModal';
import { NuevoRegistroModal } from '../components/NuevoRegistroModal';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';
import { ServicioCatalogo, RegistroServicio } from '../hooks/useServicios';
import { useDebounce } from '../../../hooks/useDebounce';
import { PaginationControls } from '../../../shared/components/PaginationControls';

type Tab = 'registros' | 'catalogo';

export default function ServiciosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('registros');
  const [isServicioModalOpen, setIsServicioModalOpen] = useState(false);
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<ServicioCatalogo | null>(null);
  
  const [pageRegistros, setPageRegistros] = useState(1);
  const [pageCatalogo, setPageCatalogo] = useState(1);

  const [searchRegistros, setSearchRegistros] = useState('');
  const [estadoRegistros, setEstadoRegistros] = useState('');
  const debouncedSearchRegistros = useDebounce(searchRegistros, 400);

  // Reset page when filters change
  React.useEffect(() => {
    setPageRegistros(1);
  }, [debouncedSearchRegistros, estadoRegistros]);

  const {
    catalogo,
    metaCatalogo,
    registros,
    metaRegistros,
    getRegistros,
    getCatalogo,
    completeRegistro,
    deleteServicioCatalogo,
    createServicioCatalogo,
    updateServicioCatalogo,
    createRegistro,
    updateRegistro,
    deleteRegistro
  } = useServicios({
    pageRegistros,
    pageCatalogo,
    searchRegistros: debouncedSearchRegistros,
    estadoRegistros
  });

  const handleComplete = async (id: number) => {
    await completeRegistro.mutateAsync({ id });
  };

  const handleDeleteCatalogo = async (id: number) => {
    await deleteServicioCatalogo.mutateAsync(id);
  };

  const handleSaveServicio = async (data: Partial<ServicioCatalogo>) => {
    if (editingServicio) {
      await updateServicioCatalogo.mutateAsync({ id: editingServicio.id, data });
    } else {
      await createServicioCatalogo.mutateAsync(data);
    }
    setEditingServicio(null);
  };

  const handleSaveRegistro = async (data: Partial<RegistroServicio> & { embarcacionId: number; servicioId: number }) => {
    await createRegistro.mutateAsync(data);
  };

  const handleUpdateRegistroStatus = async (id: number, estado: RegistroServicio['estado']) => {
    await updateRegistro.mutateAsync({ id, data: { estado } });
  };

  const handleDeleteRegistro = async (id: number) => {
    await deleteRegistro.mutateAsync(id);
  };

  const handleOpenCreate = () => {
    if (activeTab === 'registros') {
      setIsRegistroModalOpen(true);
    } else {
      setEditingServicio(null);
      setIsServicioModalOpen(true);
    }
  };

  const activeWorksCount = metaRegistros?.total || 0;
  const catalogSize = metaCatalogo?.total || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-[var(--bg-secondary)]/[0.3] p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Activity className="w-48 h-48 text-indigo-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 rounded-[2.2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-900/10">
            <Wrench className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-tight tracking-tight uppercase">Servicios & Taller</h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em]">Centro de Operaciones Técnicas </p>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-8 mt-8">
              <div className="flex flex-col">
                <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{activeWorksCount}</span>
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1">Registros Totales</span>
              </div>
              <div className="w-px h-8 bg-[var(--border-primary)] self-center" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{catalogSize}</span>
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1">Servicios Base</span>
              </div>
            </div>
          </div>
        </div>

        <RoleGuard allowedRoles={activeTab === 'registros' ? [Role.OPERADOR, Role.SUPERVISOR, Role.ADMIN, Role.SUPERADMIN] : [Role.ADMIN, Role.SUPERADMIN]}>
          <button
            onClick={handleOpenCreate}
            className="relative z-10 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/30 transition-all active:scale-95 group/btn"
          >
            <div className="p-1 bg-indigo-400/20 rounded-lg group-hover/btn:rotate-90 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            {activeTab === 'registros' ? 'Ingresar Trabajo' : 'Añadir al Catálogo'}
          </button>
        </RoleGuard>
      </div>

      {/* Modern High-Fidelity Tabs */}
      <div className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)]/[0.5] rounded-[2rem] border border-[var(--border-primary)] w-fit shadow-xl transition-colors duration-300">
        <button
          onClick={() => setActiveTab('registros')}
          className={`px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registros'
            ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
            }`}
        >
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-3.5 h-3.5" />
            Ordenes de Trabajo
          </div>
        </button>
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'catalogo'
            ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
            }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-3.5 h-3.5" />
            Catálogo Maestro
          </div>
        </button>
      </div>

      {/* Main Data Container */}
      <div className="bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden relative group/grid transition-colors duration-300 min-h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {getRegistros.isLoading || getCatalogo.isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
              <p className="mt-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] animate-pulse">Sincronizando Libro de Taller...</p>
            </div>
          ) : (
            <>
              <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
                    {activeTab === 'registros' ? <Activity className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">
                      {activeTab === 'registros' ? 'Monitor de Trabajos' : 'Catálogo de Servicios Habilitados'}
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">Control de calidad y auditoría técnica</p>
                  </div>
                </div>

                {/* Inline Filters for Registros */}
                {activeTab === 'registros' && (
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="BUSCAR NAVE O SERVICIO..."
                        value={searchRegistros}
                        onChange={(e) => setSearchRegistros(e.target.value.toUpperCase())}
                        className="w-full bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest text-[var(--text-primary)] focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl px-4 py-1.5 transition-colors">
                      <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                      <select
                        value={estadoRegistros}
                        onChange={(e) => setEstadoRegistros(e.target.value)}
                        className="bg-transparent text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest focus:outline-none py-1.5 cursor-pointer"
                      >
                        <option value="">TODOS LOS ESTADOS</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="EN_PROCESO">EN PROCESO</option>
                        <option value="COMPLETADO">COMPLETADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </div>
                    {(searchRegistros || estadoRegistros) && (
                      <button
                        onClick={() => { setSearchRegistros(''); setEstadoRegistros(''); }}
                        className="p-3 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
                        title="Limpiar Filtros"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {activeTab === 'registros' ? (
                <>
                  <RegistrosList
                    registros={registros}
                    isLoading={getRegistros.isLoading}
                    onComplete={handleComplete}
                    onUpdateStatus={handleUpdateRegistroStatus}
                    onDelete={handleDeleteRegistro}
                  />
                  {metaRegistros && (
                    <PaginationControls
                      currentPage={pageRegistros}
                      totalPages={metaRegistros.totalPages}
                      onPageChange={setPageRegistros}
                      totalItems={metaRegistros.total}
                      pageSize={metaRegistros.limit}
                    />
                  )}
                </>
              ) : (
                <>
                  <CatalogoList
                    servicios={catalogo}
                    isLoading={getCatalogo.isLoading}
                    onDelete={handleDeleteCatalogo}
                    onEdit={(svc: ServicioCatalogo) => {
                      setEditingServicio(svc);
                      setIsServicioModalOpen(true);
                    }}
                  />
                  {metaCatalogo && (
                    <PaginationControls
                      currentPage={pageCatalogo}
                      totalPages={metaCatalogo.totalPages}
                      onPageChange={setPageCatalogo}
                      totalItems={metaCatalogo.total}
                      pageSize={metaCatalogo.limit}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Persistence Modals */}
      <NuevoServicioModal
        isOpen={isServicioModalOpen}
        onClose={() => {
          setIsServicioModalOpen(false);
          setEditingServicio(null);
        }}
        onSave={handleSaveServicio}
        initialData={editingServicio}
      />

      <NuevoRegistroModal
        isOpen={isRegistroModalOpen}
        onClose={() => setIsRegistroModalOpen(false)}
        onSave={handleSaveRegistro}
      />
    </div>
  );
}
