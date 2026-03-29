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
  Box,
  X
} from 'lucide-react';
import { RackMap } from '../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import { AsignarEmbarcacionModal } from '../../infraestructura/components/AsignarEmbarcacionModal';
import { Embarcacion } from '../../embarcaciones/hooks/useEmbarcaciones';

interface MapaRacksProps {
  data: RackMap[];
  embarcacionesLibres: Embarcacion[];
  onAsignar: (embarcacionId: number, espacioId: number) => Promise<void>;
}

export const MapaRacks: React.FC<MapaRacksProps> = ({ data, embarcacionesLibres, onAsignar }) => {
  const navigate = useNavigate();
  const [expandedZona, setExpandedZona] = useState<number | null>(data[0]?.id || null);
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);
  const [selectedEspacio, setSelectedEspacio] = useState<{
    espacioId: number;
    codigo: string;
    embarcacion?: any;
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)]/40 p-12 rounded-3xl border border-[var(--border-primary)] flex flex-col items-center gap-4">
        <Box className="w-12 h-12 text-slate-700" />
        <p className="text-[var(--text-secondary)] font-medium">No hay racks configurados en el sistema.</p>
      </div>
    );
  }

  const getBoatSizeClass = (eslora: number) => {
    if (eslora < 6) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (eslora <= 10) return 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40';
    return 'bg-purple-500/40 text-purple-200 border-purple-500/50';
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Mapa Maestro de Racks</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Visualización técnica de ocupación por zona y dimensiones.</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 items-center bg-slate-800/30 px-5 py-2.5 rounded-2xl border border-slate-700/50">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mr-2">Leyenda Eslora:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50" />
            <span className="text-xs text-[var(--text-secondary)]">&lt;6m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500/40 border border-indigo-500/50" />
            <span className="text-xs text-[var(--text-secondary)]">6-10m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500/50 border border-purple-500/50" />
            <span className="text-xs text-[var(--text-secondary)]">&gt;10m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {data.map(zona => (
          <section key={zona.id} className="bg-[var(--bg-secondary)]/60 rounded-[2.5rem] border border-[var(--border-primary)] overflow-hidden shadow-2xl transition-all hover:border-slate-700">
            <button
              onClick={() => setExpandedZona(expandedZona === zona.id ? null : zona.id)}
              className="w-full flex items-center justify-between p-8 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-500/20">
                  <Maximize2 className="text-blue-400 w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{zona.nombre}</h3>
                  <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 font-mono text-xs">{zona.ubicacion.nombre}</span>
                    • {zona.racks.length} Racks configurados
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-slate-800 transition-transform duration-300 ${expandedZona === zona.id ? 'rotate-180' : ''}`}>
                <ChevronDown className="text-[var(--text-secondary)]" />
              </div>
            </button>

            {expandedZona === zona.id && (
              <div className="p-8 pt-0 grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in slide-in-from-top-4 duration-500">
                {zona.racks.map(rack => (
                  <div key={rack.id} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-[var(--text-primary)] text-[10px] font-black px-2 py-1 rounded">RACK</span>
                        <h4 className="text-lg font-bold text-[var(--text-primary)]">{rack.codigo}</h4>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">({rack.ancho}x{rack.alto}x{rack.largo}m)</span>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{rack.columnas} col x {rack.filas} filas</span>
                    </div>

                    {/* Grid Container with Horizontal Scroll */}
                    <div className="bg-black/40 p-6 rounded-[2.2rem] border border-[var(--border-primary)]/50 backdrop-blur-sm relative group mb-2 overflow-x-auto custom-scrollbar">
                      <div className="min-w-max">
                        {/* Column Headers */}
                         <div 
                          className="grid gap-3 mb-4 opacity-40 px-1"
                          style={{
                            gridTemplateColumns: `50px repeat(${rack.columnas}, minmax(0, 1fr))`
                          }}
                        >
                          <div /> {/* Top-left corner spacer */}
                          {Array.from({ length: rack.columnas }).map((_, i) => (
                            <div key={i} className="text-center font-black uppercase tracking-widest flex flex-col items-center">
                              <span className="text-[10px] text-indigo-400">Columna</span>
                              <span className="text-sm text-[var(--text-primary)]">{i + 1}</span>
                            </div>
                          ))}
                        </div>

                        <div
                          className="grid gap-3 items-center"
                          style={{
                            gridTemplateColumns: `50px repeat(${rack.columnas * rack.filas}, 110px)`,
                            gridTemplateRows: `repeat(${rack.pisos}, 110px)`
                          }}
                        >
                          {Array.from({ length: rack.pisos }).map((_, rIdx) => {
                            const p = rack.pisos - rIdx; // Piso 1 abajo
                            return (
                              <React.Fragment key={`row-${p}`}>
                                {/* Floor Label Indicator */}
                                <div className="flex flex-col items-center justify-center h-full border-r border-slate-700/40 pr-3 mr-1 sticky left-0 bg-black/20 backdrop-blur-md z-10 border-l border-white/5 rounded-l-xl">
                                  <span className="text-[10px] font-black text-indigo-500/80 tracking-tighter uppercase leading-none mb-1">Piso</span>
                                  <span className="text-xl font-black text-[var(--text-primary)] leading-none tabular-nums">{p}</span>
                                </div>

                                {Array.from({ length: rack.columnas }).map((_, cIdx) => {
                                  const c = cIdx + 1;
                                  return Array.from({ length: rack.filas }).map((_, fIdx) => {
                                    const f = fIdx + 1;
                                    const espacio = rack.espacios.find(e => e.piso === p && e.columna === c && e.fila === f);

                                    return (
                                      <div
                                        key={`cell-${p}-${c}-${f}`}
                                        onClick={() => espacio && setSelectedEspacio({
                                          espacioId: espacio.id,
                                          codigo: espacio.numero,
                                          embarcacion: espacio.embarcacion
                                        })}
                                        className={`w-[110px] h-[110px] rounded-xl border transition-all flex flex-col items-center justify-center gap-1 group/item relative
                                          ${!espacio 
                                            ? 'bg-transparent border-dashed border-slate-800/30' 
                                            : espacio.ocupado
                                              ? `${getBoatSizeClass(espacio.embarcacion?.eslora || 0)} cursor-pointer`
                                              : 'bg-[var(--bg-secondary)]/50 text-slate-600 border-[var(--border-primary)] hover:border-slate-500 hover:bg-slate-800/50 cursor-pointer'
                                          }
                                          ${f === 1 && rack.filas > 1 ? 'border-l-2 border-l-indigo-500/20' : ''}
                                        `}
                                      >
                                        {!espacio ? (
                                          <div className="text-[10px] font-mono opacity-10">NULL</div>
                                        ) : espacio.ocupado ? (
                                          <>
                                            <Anchor size={20} className={(espacio.embarcacion?.eslora || 0) > 10 ? 'animate-pulse text-white' : 'text-white/80'} />
                                            <span className="text-[9px] font-black text-center px-1 truncate w-full uppercase tracking-tighter leading-tight">
                                              {espacio.embarcacion?.nombre}
                                            </span>
                                            <div className="absolute top-1 left-1.5 px-1.5 py-0.5 bg-black/40 rounded text-[8px] font-bold backdrop-blur-sm border border-white/10 uppercase">
                                              F{f}
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-[10px] font-black opacity-30 tracking-widest">{espacio.numero.split('-').pop()}</span>
                                            <span className="text-[8px] font-bold opacity-20 uppercase">Fila {f}</span>
                                          </>
                                        )}

                                        {/* Hover Mini Info */}
                                        {espacio?.ocupado && (
                                          <div className="absolute -top-1 -right-1 bg-white text-slate-950 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity z-20 shadow-xl scale-90 group-hover/item:scale-100">
                                            <Info size={12} />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  });
                                })}
                              </React.Fragment>
                            );
                          })}
                        </div>
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
          <div className="bg-[var(--bg-secondary)] border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-[var(--text-primary)] relative">
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
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Acciones Operativas</span>

              {selectedEspacio.embarcacion ? (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => navigate(`/embarcaciones/editar/${selectedEspacio.embarcacion.id}`)}
                    className="flex items-center justify-between w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><ExternalLink size={18} /></div>
                      <span className="font-semibold text-[var(--text-primary)]">Ver Expediente</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/operaciones')}
                    className="flex items-center justify-between w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><History size={18} /></div>
                      <span className="font-semibold text-[var(--text-primary)]">Últimos Pedidos</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/operaciones')}
                    className="flex items-center justify-between w-full p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all group mt-2"
                  >
                    <div className="flex items-center gap-3 text-red-400">
                      <div className="p-2 bg-red-500/10 rounded-lg"><LogOut size={18} /></div>
                      <span className="font-semibold">Registrar Salida</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center text-[var(--text-secondary)] space-y-6">
                  <p className="font-medium">Espacio disponible para nuevas embarcaciones.</p>
                  <button
                    onClick={() => setIsAsignarOpen(true)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                  >
                    <Anchor className="w-4 h-4" />
                    Asignar Embarcación
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {selectedEspacio && (
      <AsignarEmbarcacionModal
        isOpen={isAsignarOpen}
        onClose={() => {
          setIsAsignarOpen(false);
          setSelectedEspacio(null);
        }}
        espacioId={selectedEspacio.espacioId}
        codigoEspacio={selectedEspacio.codigo}
        embarcacionesLibres={embarcacionesLibres}
        onAsignar={(embarcacionId) => onAsignar(embarcacionId, selectedEspacio.espacioId)}
      />
    )}
    </>
  );
};


