import { CreditCard, Calendar, Hash, ArrowUpRight, FileText } from 'lucide-react';

export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  metodoPago: string;
  referencia?: string;
  cliente?: { id: number; nombre: string };
  cargo?: { id: number; descripcion: string };
}

interface PagosListProps {
  pagos: Pago[];
  isLoading: boolean;
}

export function PagosList({ pagos, isLoading }: PagosListProps) {
  const extractVesselName = (pago: Pago) => {
    if (!pago.cargo?.descripcion) return 'PAGO GENERAL';
    const parts = pago.cargo.descripcion.split(/ - |: /);
    if (parts.length > 1) return parts[1];
    return pago.cargo.descripcion;
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Referencia / ID</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Embarcación</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Método</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Fecha Proceso</th>
            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Monto Recaudado</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {isLoading ? (
            <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-600 font-bold bg-[var(--bg-secondary)]/20">Recuperando registros históricos...</td></tr>
          ) : pagos.length === 0 ? (
            <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-600 font-bold bg-[var(--bg-secondary)]/20">No se detectaron transacciones procesadas.</td></tr>
          ) : (
            [...pagos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime() || b.id - a.id).map((pago) => (
              <tr key={pago.id} className="group hover:bg-slate-800/30 transition-all cursor-default">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                      <Hash className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{pago.referencia || `RECIBO-${pago.id}`}</span>
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">ORDEN: #{pago.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{pago.cliente?.nombre || 'S/D'}</span>
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Socio ID: {pago.cliente?.id || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                    {extractVesselName(pago)}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                    <CreditCard className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{pago.metodoPago}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium text-xs opacity-70">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(pago.fecha).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-8 py-5 text-right font-black text-indigo-400 text-sm whitespace-nowrap">
                  + ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const baseUrl = import.meta.env.VITE_API_URL ;
                          const response = await fetch(`${baseUrl}/pagos/${pago.id}/pdf`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (!response.ok) throw new Error(`Error ${response.status}`);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `recibo-pago-${pago.id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Error al descargar recibo:', error);
                        }
                      }}
                      className="p-2 text-slate-700 hover:text-indigo-400 transition-colors hover:bg-slate-700/50 rounded-lg"
                      title="Descargar Recibo"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-700 hover:text-indigo-300 transition-colors hover:bg-slate-700/50 rounded-lg">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
