import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Ship, Loader2, MapPin, Activity, LayoutGrid, X } from 'lucide-react';
import { useEmbarcaciones, Embarcacion } from '../hooks/useEmbarcaciones';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';
import { PaginationControls } from '../../../shared/components/PaginationControls';

import { useDebounce } from '../../../hooks/useDebounce';

export default function EmbarcacionesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { getEmbarcaciones, deleteEmbarcacion } = useEmbarcaciones({
    page,
    search: debouncedSearch,
  });

  const { isLoading, data } = getEmbarcaciones;
  const embarcaciones = data?.data || [];
  const meta = data?.meta;
  const confirm = useConfirm();

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Eliminar Embarcación',
      message: '¿Estás seguro de que deseas eliminar esta embarcación del sistema? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'danger'
    });

    if (isConfirmed) {
      await deleteEmbarcacion.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-primary)]/20 rounded-[2.5rem] border border-[var(--border-primary)]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">Sincronizando Flota Estacionaria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-[var(--bg-secondary)]/[0.3] p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Ship className="w-48 h-48 text-indigo-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 rounded-[2.2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-900/10">
            <Ship className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-tight tracking-tight uppercase">Gestión de Flota</h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em]">Monitoreo Operativo de Embarcaciones</p>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
            </div>
          </div>
        </div>

        <Link
          to="/embarcaciones/nueva"
          className="relative z-10 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 group/btn"
        >
          <div className="p-1 bg-indigo-400/20 rounded-lg group-hover/btn:rotate-90 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          Nueva Embarcación
        </Link>
      </div>

      {/* Grid Container */}
      <div className="bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden relative group/grid transition-colors duration-300 min-h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />

        {/* Search Bar Inline */}
        <div className="p-8 border-b border-[var(--border-primary)] flex items-center gap-6 bg-[var(--bg-primary)]/20 relative z-10 transition-colors duration-300">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Búsqueda inteligente por nombre, matrícula o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[var(--bg-secondary)]/[0.3] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:border-indigo-500 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-bold"
            />
          </div>
          <div className="hidden md:flex items-center gap-3 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-4 py-2 rounded-xl border border-[var(--border-primary)] transition-colors duration-300">
            <LayoutGrid className="w-3.5 h-3.5" />
            Total: {meta?.total || 0}
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/30 transition-colors duration-300">
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Embarcación / Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Dimensiones</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Propietario / Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Ubicación Actual</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-secondary)] transition-colors duration-300">
              {embarcaciones.map((emb: Embarcacion) => (
                <tr key={emb.id} className={`group hover:bg-indigo-500/5 transition-all cursor-default ${emb.estado_operativo === 'INACTIVA' ? 'opacity-40 grayscale' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-indigo-600 group-hover:text-[var(--text-primary)] group-hover:shadow-lg group-hover:shadow-indigo-900/40 transition-all duration-300">
                        <Ship className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors uppercase tracking-tight text-base leading-none mb-1.5">{emb.nombre}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.15em]">{emb.matricula} <span className="mx-2 opacity-20">|</span> {emb.tipo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="px-3 py-1.5 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-xl inline-flex items-center gap-2 transition-colors duration-300">
                      <span className="text-xs font-black text-[var(--text-primary)] tabular-nums">{emb.eslora}m</span>
                      <X className="w-2.5 h-2.5 text-[var(--text-secondary)] opacity-30" />
                      <span className="text-xs font-black text-[var(--text-primary)] tabular-nums">{emb.manga}m</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => navigate(`/clientes/editar/${emb.cliente?.id}`)}
                      className="text-xs font-black text-[var(--text-secondary)] hover:text-indigo-500 uppercase tracking-[0.1em] transition-colors border-b border-dashed border-[var(--border-primary)] hover:border-indigo-500"
                    >
                      {emb.cliente?.nombre || 'Sin asignar'}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    {emb.espacio ? (
                      <button
                        onClick={() => navigate(`/infraestructura?rack=${emb.espacio?.rack?.codigo}`)}
                        className="flex flex-col group/loc text-left hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center gap-2 text-[11px] font-black text-[var(--text-primary)] group-hover/loc:text-indigo-500 uppercase tracking-tight transition-colors">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 group-hover/loc:animate-bounce" />
                          <span>{emb.espacio.rack?.zona?.nombre}</span>
                        </div>
                        <div className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-0.5 ml-5 border-b border-dashed border-[var(--border-primary)] group-hover/loc:border-indigo-500 transition-colors">
                          Cod: {emb.espacio.rack?.codigo} • Pos: {emb.espacio.numero}
                        </div>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border-primary)]">
                        <Activity className="w-3 h-3 text-[var(--text-secondary)] opacity-30" />
                        <span className="text-[9px] font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-widest italic">A Flote / Sin Ubic.</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border inline-block ${emb.estado_operativo === 'EN_CUNA' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      emb.estado_operativo === 'EN_AGUA' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                        emb.estado_operativo === 'EN_MANTENIMIENTO' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          'bg-[var(--bg-primary)]/40 text-[var(--text-secondary)] border-[var(--border-primary)]/50'
                      }`}>
                      {emb.estado_operativo.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 md:gap-3">
                      <button
                        onClick={() => navigate(`/embarcaciones/editar/${emb.id}`)}
                        className="p-2 md:p-3 bg-[var(--bg-primary)]/60 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-indigo-500 hover:border-indigo-500/50 rounded-xl md:rounded-2xl transition-all active:scale-90 shadow-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
                        <button
                          onClick={() => handleDelete(emb.id)}
                          className="p-2 md:p-3 bg-[var(--bg-primary)]/60 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/50 rounded-xl md:rounded-2xl transition-all active:scale-90 shadow-xl"
                          disabled={deleteEmbarcacion.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              ))}
              {embarcaciones.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center bg-[var(--bg-primary)]/10">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)]">
                        <Ship className="w-10 h-10" />
                      </div>
                      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] max-w-xs mx-auto">
                        No se encontraron unidades con los criterios de búsqueda.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <PaginationControls
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            totalItems={meta.total}
            pageSize={meta.limit}
          />
        )}
      </div>
    </div>
  );
}
