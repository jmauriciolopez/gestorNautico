import { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useClientes } from '../../clientes/hooks/useClientes';
import { CuentaCorrientePanel } from '../../clientes/components/CuentaCorrientePanel';

export function CuentasCorrientesList() {
  const { getClientes } = useClientes();
  const clientes = (getClientes.data?.data || []).filter(c => c.activo);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.dni.includes(search)
  );

  return (
    <div>
      {/* Buscador */}
      <div className="p-6 border-b border-[var(--border-primary)]">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-[var(--border-primary)]">
        {filtered.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest">Sin clientes</p>
          </div>
        ) : (
          filtered.map(cliente => {
            const isOpen = expandedId === cliente.id;
            return (
              <div key={cliente.id}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : cliente.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-surface)] transition-colors text-left"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{cliente.nombre}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">DNI {cliente.dni}</p>
                  </div>
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Ver cuenta corriente
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 bg-[var(--bg-surface)]/50">
                    <CuentaCorrientePanel clienteId={cliente.id} clienteNombre={cliente.nombre} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
