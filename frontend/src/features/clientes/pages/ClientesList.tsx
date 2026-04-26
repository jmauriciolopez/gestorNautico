import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Loader2, Users, Receipt, Mail, Phone, ShieldCheck, ShieldAlert, ShieldPlus } from 'lucide-react';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { useClientes } from '../hooks/useClientes';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';
import { PaginationControls } from '../../../shared/components/PaginationControls';

import { useDebounce } from '../../../hooks/useDebounce';
import { useActiveGuarderiaId } from '../../../shared/hooks/useActiveGuarderiaId';

export default function ClientesList() {
  const navigate = useNavigate();
  const guarderiaId = useActiveGuarderiaId();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Reset when guarderia changes
  React.useEffect(() => {
    setPage(1);
    setSearch('');
  }, [guarderiaId]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { clientes, meta, deleteCliente, updateCliente, getClientes } = useClientes({ page, search: debouncedSearch });
  const { isLoading } = getClientes;
  const confirm = useConfirm();

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Archivar Cliente',
      message: '¿Estás seguro de que deseas archivar este cliente? Se desactivará su acceso y se conservarán sus registros históricos.',
      confirmText: 'Archivar',
      variant: 'danger'
    });

    if (isConfirmed) {
      await deleteCliente.mutateAsync(id);
    }
  };

  const handleActivar = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Activar Cliente',
      message: '¿Deseas reactivar este cliente? Se restaurará su acceso al sistema.',
      confirmText: 'Activar',
    });

    if (isConfirmed) {
      await updateCliente.mutateAsync({ id, data: { activo: true } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-primary)]/20 rounded-[2.5rem] border border-[var(--border-primary)]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">Consultando Padrón de Clientes Estacionarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-[var(--bg-secondary)]/[0.3] p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Users className="w-48 h-48 text-indigo-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 rounded-[2.2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-900/10">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-tight tracking-tight uppercase">Clientes</h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em]">Gestión de Cuentas y Contactos Administrativos Habilitados</p>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            </div>
          </div>
        </div>

        <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN, Role.SUPERVISOR]}>
          <Link
            to="/clientes/nuevo"
            className="relative z-10 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all active:scale-95 group/btn"
          >
            <div className="p-1 bg-indigo-400/20 rounded-lg group-hover/btn:rotate-90 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            Nuevo Cliente
          </Link>
        </RoleGuard>
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
              placeholder="Búsqueda inteligente por nombre o identificación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[var(--bg-secondary)]/[0.3] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:border-indigo-500 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-bold"
            />
          </div>
          <div className="hidden md:flex items-center gap-3 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest bg-[var(--bg-primary)]/40 px-4 py-2 rounded-xl border border-[var(--border-primary)] transition-colors duration-300">
            <Receipt className="w-3.5 h-3.5" />
            Clientes: {meta?.total || 0}
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/30 transition-colors duration-300">
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Razón Social / Identidad</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Canales de Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cuota</th>
                {/* <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Mesa de Auditoría</th> */}
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-secondary)] transition-colors duration-300">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className={`group hover:bg-indigo-500/5 transition-all cursor-default ${!cliente.activo ? 'opacity-50 grayscale duration-700' : ''}`}>
                  <td className={`px-8 py-6 ${!cliente.activo ? 'pointer-events-none' : ''}`}>
                    <div className="flex flex-col">
                      <div className="font-black text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors uppercase tracking-tight text-base leading-none mb-1.5">{cliente.nombre}</div>
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Ident:</span>
                        <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-80 tabular-nums bg-[var(--bg-primary)]/60 px-2 py-0.5 rounded border border-[var(--border-primary)]">{cliente.dni}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`px-8 py-6 ${!cliente.activo ? 'pointer-events-none' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] text-[11px] font-bold">
                        <Mail className="w-3.5 h-3.5 text-indigo-500/60" />
                        {cliente.email || <span className="text-[var(--text-secondary)] opacity-40 italic lowercase tracking-tight">n/a</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-widest">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-30" />
                        {cliente.telefono || 'n/a'}
                      </div>
                    </div>
                  </td>
                  <td className={`px-8 py-6 ${!cliente.activo ? 'pointer-events-none' : ''}`}>
                    {cliente.activo ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verificado</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-primary)]/40 border border-[var(--border-primary)]/50 opacity-50">
                        <ShieldAlert className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Inactivo</span>
                      </div>
                    )}
                  </td>
                  <td className={`px-8 py-6 ${!cliente.activo ? 'pointer-events-none' : ''}`}>
                    <div className="inline-flex items-center gap-2 bg-[var(--bg-primary)]/60 px-3 py-1 rounded-lg border border-[var(--border-primary)] transition-colors duration-300">
                      <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] tracking-tighter">{cliente.tipoCuota}</span>
                    </div>
                  </td>
                  {/* <td className={`px-8 py-6 text-right ${!cliente.activo ? 'pointer-events-none' : ''}`}>
                    <div className="inline-flex items-center gap-2 bg-[var(--bg-primary)]/60 px-3 py-1 rounded-lg border border-[var(--border-primary)] transition-colors duration-300">
                      <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] tracking-tighter">{cliente.id.toString().padStart(4, '0')}</span>
                    </div>
                  </td> */}

                  <td className="px-4 md:px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 md:gap-3">
                      <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN, Role.SUPERVISOR]}>
                        <button
                          onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                          className="p-2 md:p-3 bg-[var(--bg-primary)]/60 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-indigo-400 hover:border-indigo-500/50 rounded-xl md:rounded-2xl transition-all active:scale-90 shadow-xl"
                          title="Editar Expediente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </RoleGuard>
                      <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
                        {cliente.activo ? (
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="p-2 md:p-3 bg-[var(--bg-primary)]/60 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/50 rounded-xl md:rounded-2xl transition-all active:scale-90 shadow-xl"
                            title="Archivar Registro"
                            disabled={deleteCliente.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivar(cliente.id)}
                            className="p-2 md:p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/60 rounded-xl md:rounded-2xl transition-all active:scale-90 shadow-xl"
                            title="Reactivar Cliente"
                            disabled={updateCliente.isPending}
                          >
                            <ShieldPlus className="w-4 h-4" />
                          </button>
                        )}
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center bg-[var(--bg-primary)]/10">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)]">
                        <Users className="w-10 h-10" />
                      </div>
                      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] max-w-xs mx-auto">
                        No se encontraron clientes con los criterios de búsqueda.
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
