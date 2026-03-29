import { Package, Loader2, Pencil, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ServicioCatalogo } from '../hooks/useServicios';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';

interface CatalogoListProps {
  servicios: ServicioCatalogo[];
  isLoading: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (svc: ServicioCatalogo) => void;
}

export function CatalogoList({ servicios, isLoading, onDelete, onEdit }: CatalogoListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)]/20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest leading-relaxed">Sincronizando Catálogo Maestro...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Servicio / Operación</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Categoría</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Precio Base</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-primary)]/40">
          {servicios.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-24 text-center">
                <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-[var(--text-secondary)]/40">
                  <Package className="w-8 h-8" />
                </div>
                <p className="text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">No se detectaron servicios en el catálogo.</p>
              </td>
            </tr>
          ) : (
            servicios.map((svc) => (
              <tr key={svc.id} className="group hover:bg-[var(--bg-secondary)]/30 transition-all cursor-default">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-[var(--text-primary)] transition-all duration-300">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{svc.nombre}</p>
                      {svc.descripcion && <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5 line-clamp-1">{svc.descripcion}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] px-2.5 py-1 rounded inline-block border border-[var(--border-primary)]/50 uppercase tracking-widest">
                    {svc.categoria}
                  </span>
                </td>
                <td className="px-8 py-5">
                  {svc.activo ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 fill-emerald-500/10" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-500/10 border border-slate-500/20">
                      <ShieldAlert className="w-3 h-3 text-[var(--text-secondary)] fill-slate-500/10" />
                      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Inactivo</span>
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm tabular-nums tracking-tighter">
                  ${Number(svc.precioBase).toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
                    <div className="flex items-center justify-end gap-3 outline-none">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(svc)}
                          className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all active:scale-90"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(svc.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </RoleGuard>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
