import { useState } from 'react';
import { CreditCard, Calendar, Hash, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { usePagosPaginados, Pago } from '../hooks/useFinanzas';
import { toast } from 'react-hot-toast';
import { httpClient } from '../../../shared/api/HttpClient';

const PAGE_SIZE = 20;

export function PagosList() {
  const [page, setPage] = useState(1);

  const { query } = usePagosPaginados(page, PAGE_SIZE);
  const { data, isLoading, isFetching } = query;
  const pagos: Pago[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleDescargarPdf = async (pago: Pago) => {
    try {
      const blob = await httpClient.get<Blob>(`/pagos/${pago.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-pago-${pago.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Recibo descargado');
    } catch (error) {
      toast.error('No se pudo descargar el recibo');
      console.error(error);
    }
  };

  return (
    <>
      <div className={`overflow-x-auto custom-scrollbar transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/20">
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Referencia / ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cliente</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Concepto</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Método</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Fecha</th>
              <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Monto</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-secondary)]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Recuperando registros históricos...</span>
                  </div>
                </td>
              </tr>
            ) : pagos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center text-[var(--text-muted)] font-bold bg-[var(--bg-secondary)]/20">
                  No se detectaron transacciones procesadas.
                </td>
              </tr>
            ) : (
              // Backend ya ordena por fecha DESC — no client-side sort
              pagos.map((pago) => (
                <tr key={pago.id} className="group hover:bg-[var(--bg-card-hover)] transition-all cursor-default">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-secondary)]">
                        <Hash className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">
                          {pago.comprobante || `RECIBO-${pago.id}`}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">
                          ORDEN: #{pago.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">
                        {pago.cliente?.nombre || 'S/D'}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">
                        ID: {pago.cliente?.id || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.15em] bg-[var(--accent-primary-soft)] px-3 py-1 rounded-full border border-[var(--accent-primary-ring)]">
                      {pago.cargo?.descripcion?.split(/ - |: /)[0] || 'PAGO GENERAL'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-ring)]">
                      <CreditCard className="w-3 h-3 text-[var(--accent-primary)]" />
                      <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-widest">{pago.metodoPago}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium text-xs">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      {pago.fecha && !isNaN(new Date(pago.fecha).getTime()) ? (
                        new Date(pago.fecha).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                      ) : (
                        <span className="opacity-50 italic">S/F</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[var(--accent-primary)] text-sm whitespace-nowrap">
                    + ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => handleDescargarPdf(pago)}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary-soft)] rounded-lg"
                      title="Descargar Recibo PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-5 border-t border-[var(--border-secondary)]">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Página {page} de {totalPages} · {total} pagos
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Anterior</span>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1
                  : page <= 4 ? i + 1
                  : page >= totalPages - 3 ? totalPages - 6 + i
                  : page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} disabled={isFetching}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all active:scale-90 ${p === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >{p}</button>
                );
              })}
            </div>
            <button
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
