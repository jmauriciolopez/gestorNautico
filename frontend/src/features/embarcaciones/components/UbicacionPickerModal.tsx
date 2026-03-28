import { useState, useMemo } from 'react';
import { X, Map, Layers, LayoutGrid } from 'lucide-react';

interface Zona {
  id: number;
  nombre: string;
  racks: Rack[];
}

interface Rack {
  id: number;
  codigo: string;
  espacios: Espacio[];
}

interface Espacio {
  id: number;
  numero: string;
  ocupado: boolean;
  rackId: number;
}

interface UbicacionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  zonas: Zona[];
  onSelect: (espacioId: number) => void;
  currentEspacioId?: number;
}

export default function UbicacionPickerModal({
  isOpen,
  onClose,
  zonas,
  onSelect,
  currentEspacioId
}: UbicacionPickerModalProps) {
  const [selectedZonaId, setSelectedZonaId] = useState<number | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<number | null>(null);

  // Derive selected objects
  const zonaSeleccionada = zonas.find(z => z.id === selectedZonaId);
  const rackSeleccionado = zonaSeleccionada?.racks.find(r => r.id === selectedRackId);

  // Filter available spaces
  const espaciosDisponibles = useMemo(() => {
    if (!rackSeleccionado) return [];
    return rackSeleccionado.espacios
      .filter(e => e.ocupado === false || e.id === Number(currentEspacioId))
      .sort((a, b) => a.id - b.id);
  }, [rackSeleccionado, currentEspacioId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/50">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
              <Map className="w-6 h-6 text-blue-400" />
              Asignar Ubicación
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Navega por la infraestructura para encontrar un espacio libre.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Col 1: Zonas */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Map className="w-4 h-4" /> 1. Zona
            </h4>
            <div className="space-y-2">
              {zonas.map(zona => (
                <button
                  key={zona.id}
                  type="button"
                  onClick={() => {
                    setSelectedZonaId(zona.id);
                    setSelectedRackId(null);
                  }}
                  className={`w-full text-left px-5 py-4 rounded-2xl border font-bold transition-all ${selectedZonaId === zona.id
                    ? 'bg-blue-600 border-blue-500 text-[var(--text-primary)] shadow-lg shadow-blue-600/20'
                    : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-indigo-500/50'
                    }`}
                >
                  {zona.nombre}
                </button>
              ))}
              {zonas.length === 0 && (
                <div className="text-[var(--text-secondary)] text-sm text-center py-4 bg-[var(--bg-primary)]/50 rounded-xl border border-[var(--border-primary)]/50 border-dashed">
                  No hay zonas configuradas.
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Racks */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> 2. Rack
            </h4>
            <div className="space-y-2">
              {!selectedZonaId && (
                <div className="text-[var(--text-secondary)] text-sm text-center py-4 bg-[var(--bg-primary)]/50 rounded-xl border border-[var(--border-primary)]/50 border-dashed">
                  Selecciona una zona primero.
                </div>
              )}
              {zonaSeleccionada?.racks.map(rack => {
                const tieneLibres = rack.espacios.some(e => e.ocupado === false || e.id === Number(currentEspacioId));
                return (
                  <button
                    key={rack.id}
                    type="button"
                    onClick={() => setSelectedRackId(rack.id)}
                    disabled={!tieneLibres}
                    className={`w-full text-left px-5 py-4 rounded-2xl border font-bold transition-all ${selectedRackId === rack.id
                      ? 'bg-blue-600 border-blue-500 text-[var(--text-primary)] shadow-lg shadow-blue-600/20'
                      : !tieneLibres
                        ? 'bg-[var(--bg-primary)]/50 border-[var(--border-primary)]/50 text-[var(--text-secondary)] opacity-40 cursor-not-allowed'
                        : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-indigo-500/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{rack.codigo}</span>
                      {!tieneLibres && <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">Lleno</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 3: Espacios */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> 3. Espacio Libre
            </h4>
            <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl p-4 min-h-[300px]">
              {!selectedRackId && (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm p-4 text-center">
                  <LayoutGrid className="w-8 h-8 opacity-20 mb-3" />
                  Selecciona un rack para ver sus espacios libres.
                </div>
              )}
              {selectedRackId && (
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 pb-2">
                  {espaciosDisponibles.map(espacio => (
                    <button
                      key={espacio.id}
                      type="button"
                      onClick={() => {
                        onSelect(espacio.id);
                        onClose();
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-[var(--text-primary)] active:scale-95 relative"
                    >
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest group-hover:text-emerald-500/50 transition-colors mb-1">Cuna</span>
                      <span className="text-xl font-bold font-mono">{espacio.numero}</span>
                      {espacio.id === Number(currentEspacioId) && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                    </button>
                  ))}
                  {espaciosDisponibles.length === 0 && rackSeleccionado && (
                    <div className="col-span-2 text-center text-[var(--text-secondary)] text-sm py-10">
                      No se encontraron espacios configurados.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/50 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              // Unassign (put afloat)
              onSelect(null as unknown as number);
              onClose();
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest transition-colors py-2 px-4 rounded-xl hover:bg-[var(--bg-primary)]"
          >
            Quitar ubicación (Poner a flote)
          </button>
        </div>
      </div>
    </div>
  );
}
