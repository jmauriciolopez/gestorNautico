import React, { useState } from 'react';
import { 
  Anchor, 
  Maximize2, 
  Info, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  LogOut,
  History,
  Box
} from 'lucide-react';
import { RackMap } from '../hooks/useDashboard';

interface MapaRacksProps {
  data: RackMap[];
}

export const MapaRacks: React.FC<MapaRacksProps> = ({ data }) => {
  const [expandedZona, setExpandedZona] = useState<number | null>(data[0]?.id || null);
  const [selectedEspacio, setSelectedEspacio] = useState<{
    rackId: number;
    espacioId: number;
    embarcacion?: any;
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/40 p-12 rounded-3xl border border-slate-800 flex flex-col items-center gap-4">
        <Box className="w-12 h-12 text-slate-700" />
        <p className="text-slate-500 font-medium">No hay racks configurados en el sistema.</p>
      </div>
    );
  }

  const getBoatSizeClass = (eslora: number) => {
    if (eslora < 6) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (eslora <= 10) return 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40';
    return 'bg-purple-500/40 text-purple-200 border-purple-500/50';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mapa Maestro de Racks</h2>
          <p className="text-slate-400 text-sm mt-1">Visualización técnica de ocupación por zona y dimensiones.</p>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 items-center bg-slate-800/30 px-5 py-2.5 rounded-2xl border border-slate-700/50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Leyenda Eslora:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50" />
            <span className="text-xs text-slate-400">&lt;6m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500/40 border border-indigo-500/50" />
            <span className="text-xs text-slate-400">6-10m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500/50 border border-purple-500/50" />
            <span className="text-xs text-slate-400">&gt;10m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {data.map(zona => (
          <section key={zona.id} className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-slate-700">
            <button 
              onClick={() => setExpandedZona(expandedZona === zona.id ? null : zona.id)}
              className="w-full flex items-center justify-between p-8 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-500/20">
                  <Maximize2 className="text-blue-400 w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">{zona.nombre}</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 font-mono text-xs">{zona.ubicacion.nombre}</span>
                    • {zona.racks.length} Racks configurados
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-slate-800 transition-transform duration-300 ${expandedZona === zona.id ? 'rotate-180' : ''}`}>
                <ChevronDown className="text-slate-400" />
              </div>
            </button>

            {expandedZona === zona.id && (
              <div className="p-8 pt-0 grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in slide-in-from-top-4 duration-500">
                {zona.racks.map(rack => (
                  <div key={rack.id} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded">RACK</span>
                        <h4 className="text-lg font-bold text-slate-200">{rack.codigo}</h4>
                        <span className="text-xs text-slate-500 font-mono">({rack.ancho}x{rack.alto}x{rack.largo}m)</span>
                      </div>
                      <span className="text-xs text-slate-500">{rack.columnas} col x {rack.filas} filas</span>
                    </div>

                    {/* Grid Container */}
                    <div className="bg-black/40 p-4 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm relative group">
                      <div 
                        className="grid gap-3"
                        style={{ 
                          gridTemplateColumns: `repeat(${rack.columnas}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${rack.pisos}, minmax(0, 1fr))`
                        }}
                      >
                        {Array.from({ length: rack.pisos }).map((_, rIdx) => {
                          const p = rack.pisos - rIdx; // Piso 1 abajo
                          return Array.from({ length: rack.columnas }).map((_, cIdx) => {
                            const c = cIdx + 1;
                            const espacio = rack.espacios.find(e => e.piso === p && e.columna === c);
                            
                            if (!espacio) return <div key={`empty-${p}-${c}`} className="aspect-square bg-slate-950/20 rounded-xl border border-dashed border-slate-800/30" />;

                            return (
                              <div 
                                key={espacio.id}
                                onClick={() => setSelectedEspacio({ 
                                  rackId: rack.id, 
                                  espacioId: espacio.id, 
                                  embarcacion: espacio.embarcacion 
                                })}
                                className={`aspect-square rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group/item relative ${
                                  espacio.ocupado 
                                    ? getBoatSizeClass(espacio.embarcacion?.eslora || 0)
                                    : 'bg-slate-900/50 text-slate-600 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                                }`}
                              >
                                {espacio.ocupado ? (
                                  <>
                                    <Anchor size={18} className={(espacio.embarcacion?.eslora || 0) > 10 ? 'animate-pulse' : ''} />
                                    <span className="text-[8px] font-bold text-center px-1 truncate w-full">
                                      {espacio.embarcacion?.nombre}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-mono opacity-40">{espacio.numero.split('-').pop()}</span>
                                )}

                                {/* Hover Mini Info */}
                                {espacio.ocupado && (
                                  <div className="absolute -top-2 -right-2 bg-white text-slate-950 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity z-10 shadow-xl">
                                    <Info size={10} />
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Quick Action Overlay (Drawer/Modal pseudo) */}
      {selectedEspacio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
              <button 
                onClick={() => setSelectedEspacio(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Anchor size={24} />
                </div>
                <div>
                  <h5 className="text-2xl font-bold">{selectedEspacio.embarcacion?.nombre || 'Espacio Libre'}</h5>
                  <p className="opacity-80 font-mono text-sm">{selectedEspacio.embarcacion?.matricula || 'SIN ASIGNAR'}</p>
                </div>
              </div>

              {selectedEspacio.embarcacion && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Eslora</p>
                    <p className="text-xl font-bold">{selectedEspacio.embarcacion.eslora}m</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Manga</p>
                    <p className="text-xl font-bold">{selectedEspacio.embarcacion.manga}m</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acciones Operativas</span>
              
              {selectedEspacio.embarcacion ? (
                <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center justify-between w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><ExternalLink size={18} /></div>
                      <span className="font-semibold text-white">Ver Expediente</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="flex items-center justify-between w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><History size={18} /></div>
                      <span className="font-semibold text-white">Últimos Pedidos</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="flex items-center justify-between w-full p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all group mt-2">
                    <div className="flex items-center gap-3 text-red-400">
                      <div className="p-2 bg-red-500/10 rounded-lg"><LogOut size={18} /></div>
                      <span className="font-semibold">Registrar Salida</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <p>Espacio disponible para nuevas embarcaciones.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
