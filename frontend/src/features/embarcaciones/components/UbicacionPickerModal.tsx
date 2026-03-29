import { useState, useMemo } from 'react';
import { X, Map as MapIcon, Layers, LayoutGrid } from 'lucide-react';
import { Zona } from '../../infraestructura/hooks/useUbicaciones';

interface UbicacionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  zonas: Zona[];
  onSelect: (espacioId: number | null) => void;
  currentEspacioId?: number;
  boatDimensions?: {
    eslora: number;
    manga: number;
  };
}

export default function UbicacionPickerModal({
  isOpen,
  onClose,
  zonas,
  onSelect,
  currentEspacioId,
  boatDimensions
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
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-800/50">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <MapIcon className="w-6 h-6 text-blue-400" />
              Asignar Ubicación
            </h3>
            <p className="text-slate-400 text-sm mt-1">Navega por la infraestructura para encontrar un espacio libre.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-700 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Col 1: Zonas */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MapIcon className="w-4 h-4" /> 1. Zona
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
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-500/50'
                    }`}
                >
                  {zona.nombre}
                </button>
              ))}
              {zonas.length === 0 && (
                <div className="text-slate-500 text-sm text-center py-4 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                  No hay zonas configuradas.
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Racks */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> 2. Rack
            </h4>
            <div className="space-y-2">
              {!selectedZonaId && (
                <div className="text-slate-500 text-sm text-center py-4 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                  Selecciona una zona primero.
                </div>
              )}
              {zonaSeleccionada?.racks.map(rack => {
                const tieneLibres = rack.espacios.some(e => e.ocupado === false || e.id === Number(currentEspacioId));
                
                // Dimension validation
                const esDemasiadoGrande = boatDimensions && (
                  (rack.largo > 0 && boatDimensions.eslora > rack.largo) ||
                  (rack.ancho > 0 && boatDimensions.manga > rack.ancho)
                );

                const isDisabled = !tieneLibres || esDemasiadoGrande;

                return (
                  <button
                    key={rack.id}
                    type="button"
                    onClick={() => setSelectedRackId(rack.id)}
                    disabled={isDisabled}
                    className={`w-full text-left px-5 py-4 rounded-2xl border font-bold transition-all ${selectedRackId === rack.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : isDisabled
                        ? 'bg-slate-900/50 border-slate-700/50 text-slate-500 opacity-40 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-500/50'
                      }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span>{rack.codigo}</span>
                        {!tieneLibres && <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">Lleno</span>}
                        {tieneLibres && esDemasiadoGrande && <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">Chico</span>}
                      </div>
                      {esDemasiadoGrande && (
                        <span className="text-[9px] text-amber-500/70 font-medium leading-tight text-wrap">
                          Eslora/Manga insuficiente ({rack.largo}x{rack.ancho}m)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 3: Espacios */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> 3. Espacio Libre
            </h4>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 min-h-[300px]">
              {!selectedRackId && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm p-4 text-center">
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
                      className="group flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-white active:scale-95 relative"
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-emerald-500/50 transition-colors mb-1">Cuna</span>
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
                    <div className="col-span-2 text-center text-slate-500 text-sm py-10">
                      No se encontraron espacios configurados.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              // Unassign (put afloat)
              onSelect(null);
              onClose();
            }}
            className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors py-2 px-4 rounded-xl hover:bg-slate-900"
          >
            Quitar ubicación (Poner a flote)
          </button>
        </div>
      </div>
    </div>
  );
}
