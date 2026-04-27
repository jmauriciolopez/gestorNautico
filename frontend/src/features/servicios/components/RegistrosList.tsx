import { Wrench, CheckCircle2, Clock, XCircle, Loader2, Trash2, Ship, ChevronRight } from 'lucide-react';
import { RegistroServicio } from '../hooks/useServicios';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';

interface RegistrosListProps {
  registros: RegistroServicio[];
  isLoading: boolean;
  onComplete?: (id: number) => void;
  onUpdateStatus?: (id: number, status: RegistroServicio['estado']) => void;
  onDelete?: (id: number) => void;
}

const estadoBadge: Record<RegistroServicio['estado'], { color: string; icon: React.ReactNode; label: string }> = {
  PENDIENTE: { color: 'bg-amber-500/10 border-amber-500/20 text-amber-500', icon: <Clock className="w-3 h-3" />, label: 'Pendiente' },
  EN_PROCESO: { color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'En Proceso' },
  COMPLETADO: { color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Completado' },
  CANCELADO: { color: 'bg-rose-500/10 border-rose-500/20 text-rose-500', icon: <XCircle className="w-3 h-3" />, label: 'Cancelado' },
};

export function RegistrosList({ registros, isLoading, onComplete, onUpdateStatus, onDelete }: RegistrosListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)]/20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest leading-relaxed">Sincronizando Libro de Trabajos...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Embarcación / Propietario</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Servicio Técnico</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Prog.</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Estado</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Costo Final</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-primary)]/40">
          {registros.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-8 py-24 text-center">
                <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 text-[var(--text-secondary)]/40">
                  <Wrench className="w-8 h-8" />
                </div>
                <p className="text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest">No se detectaron registros de servicio.</p>
              </td>
            </tr>
          ) : (
            registros.map((reg) => {
              const badge = estadoBadge[reg.estado];
              return (
                <tr key={reg.id} className="group hover:bg-[var(--bg-secondary)]/30 transition-all cursor-default">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-indigo-600 group-hover:text-[var(--text-primary)] transition-all duration-300">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{reg.embarcacion?.nombre}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">{reg.embarcacion?.matricula}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight opacity-90">{reg.servicio?.nombre}</p>
                      <ChevronRight className="w-3 h-3 text-[var(--border-primary)]" />
                      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{reg.servicio?.categoria}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[11px] text-[var(--text-secondary)] font-black uppercase">
                    {reg.fechaProgramada && !isNaN(new Date(reg.fechaProgramada).getTime()) ? (
                      new Date(reg.fechaProgramada).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
                    ) : (
                      <span className="opacity-50 italic">Pte.</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${badge.color}`}>
                        <span className={`${reg.estado === 'EN_PROCESO' ? 'animate-pulse' : ''}`}>{badge.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{badge.label}</span>
                      </div>
                      {reg.estado === 'COMPLETADO' && (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${reg.facturado ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 opacity-60'}`}>
                          {reg.facturado ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Facturado
                            </>
                          ) : (
                            <>
                              <XCircle className="w-2.5 h-2.5" />
                              Pte. Facturación
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[var(--text-primary)] text-sm tabular-nums tracking-tighter">
                    ${Number(reg.costoFinal || reg.servicio?.precioBase || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 outline-none">
                      {reg.estado === 'PENDIENTE' && onUpdateStatus && (
                        <button
                          onClick={() => onUpdateStatus(reg.id, 'EN_PROCESO')}
                          className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-[var(--text-primary)] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-indigo-500/20"
                        >
                          Iniciar
                        </button>
                      )}
                      {reg.estado === 'EN_PROCESO' && onComplete && (
                        <button
                          onClick={() => onComplete(reg.id)}
                          className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-[var(--text-primary)] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-500/20"
                        >
                          Completar
                        </button>
                      )}
                      {(reg.estado === 'PENDIENTE' || reg.estado === 'EN_PROCESO') && onUpdateStatus && (
                        <button
                          onClick={() => onUpdateStatus(reg.id, 'CANCELADO')}
                          className="p-2 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(reg.id)}
                            className="p-2 text-[var(--border-primary)] hover:text-rose-500 transition-all active:scale-90"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
