import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Box,
  Anchor
} from 'lucide-react';
import { Rack } from '../hooks/useUbicaciones';
import { useNavigate } from 'react-router-dom';

interface MapaOcupacionProps {
  racks: Rack[];
  is3D?: boolean;
  highlightedQuery?: string;
}

interface OccupancyRack3DContainerProps {
  rack: Rack;
  is3D: boolean;
  getBoatSizeClass: (eslora: number) => string;
  highlightedQuery?: string;
}

const OccupancyRack3DContainer: React.FC<OccupancyRack3DContainerProps> = ({ 
  rack, 
  is3D, 
  getBoatSizeClass,
  highlightedQuery
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // Inicializar/resetear variables CSS cuando cambia el modo
  useEffect(() => {
    if (!localRef.current) return;
    if (is3D) {
      localRef.current.style.setProperty('--rotate-x', '22deg');
      localRef.current.style.setProperty('--rotate-y', '-12deg');
      localRef.current.style.setProperty('--zoom', '1');
    } else {
      localRef.current.style.removeProperty('--rotate-x');
      localRef.current.style.removeProperty('--rotate-y');
      localRef.current.style.removeProperty('--zoom');
    }
    setZoom(1);
  }, [is3D]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!is3D || !localRef.current) return;
    
    const { left, top, width, height } = localRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    // Sensibilidad ajustada
    const rotateY = -25 + (x * 20); 
    const rotateX = 30 - (y * 15);
    
    localRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    localRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!is3D || !localRef.current) return;
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.min(Math.max(zoom + delta, 0.8), 2.0);
    setZoom(newZoom);
    localRef.current.style.setProperty('--zoom', `${newZoom}`);
  };

  const handleMouseLeave = () => {
    if (!is3D || !localRef.current) return;
    localRef.current.style.setProperty('--rotate-y', '-12deg');
    localRef.current.style.setProperty('--rotate-x', '22deg');
    localRef.current.style.setProperty('--zoom', '1');
    setZoom(1);
  };

  return (
    <div 
      ref={localRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      className={`p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 transition-all duration-700 ${is3D ? 'rack-3d-scene rack-3d-active overflow-visible mb-12' : 'overflow-x-auto custom-scrollbar'}`}
    >
      <div className="min-w-max">
        {is3D ? (
          /* VISTA 3D: Eje Z = Pisos, Y = Filas, X = Columnas */
          <div
            className="grid gap-2 items-center"
            style={{
              gridTemplateColumns: `50px repeat(${rack.columnas}, 85px)`,
              gridTemplateRows: `repeat(${rack.filas}, 85px)`
            }}
          >
            {Array.from({ length: rack.filas }).map((_, fIdx) => {
              const f = fIdx + 1;
              return (
                <React.Fragment key={`fila-${f}`}>
                  <div className="flex flex-col items-center justify-center h-full border-r-2 border-indigo-500/50 pr-6 mr-2 floor-pillar-3d px-8 rounded-xl translate-z-[160px] bg-slate-900/90 backdrop-blur-sm border-y border-white/5 shadow-2xl">
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-tighter leading-none mb-1">Fila</span>
                    <span className="text-4xl font-black text-white leading-none tabular-nums italic drop-shadow-md">{f}</span>
                  </div>

                  {Array.from({ length: rack.columnas }).map((_, cIdx) => {
                    const c = cIdx + 1;
                    return (
                      <div key={`stack-${f}-${c}`} className="relative h-[85px] w-[85px]">
                        {Array.from({ length: rack.pisos }).map((_, pIdx) => {
                          const p = pIdx + 1;
                          const espacio = rack.espacios.find((e: any) => e.piso === p && e.columna === c && e.fila === f);

                          return (
                            <button
                              key={`cell-${p}-${c}-${f}`}
                              className={`
                                absolute inset-0 rounded-lg border-2 transition-all duration-700 flex flex-col items-center justify-center gap-1 group/item cell-3d
                                  ${!espacio 
                                   ? 'bg-transparent border-dashed border-white/10 opacity-10' 
                                   : espacio.ocupado
                                     ? `${getBoatSizeClass(espacio.embarcacion?.eslora || 0)} shadow-xl z-10 border-2 ${
                                         highlightedQuery && espacio.embarcacion?.nombre.toLowerCase().includes(highlightedQuery.toLowerCase())
                                         ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-900 scale-110 z-30 border-yellow-400'
                                         : ''
                                       }`
                                     : `bg-slate-800/40 border-white/20 hover:border-indigo-400 ${
                                         highlightedQuery && rack.codigo.toLowerCase() === highlightedQuery.toLowerCase()
                                         ? 'border-indigo-500 bg-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                         : ''
                                       }`
                                 }}
                              `}
                              style={{
                                transform: `translateZ(${p * 80}px) translateX(${p * 2}px) translateY(-${p * 2}px)`,
                                zIndex: 20 - p
                              }}
                            >
                              {espacio && (
                                <>
                                  <div className="cell-volume-side cell-volume-top" />
                                  <div className="cell-volume-side cell-volume-left" />
                                </>
                              )}

                              {espacio?.ocupado ? (
                                <Anchor size={20} className="text-white drop-shadow-md" />
                              ) : (
                                <span className="text-[10px] font-black opacity-10">{p}</span>
                              )}

                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-50 text-white tracking-widest uppercase pointer-events-none">
                                Z{p}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          /* VISTA 2D: Eje Y = Pisos (1 abajo), Eje X = (Columnas x Filas) */
          <>
            <div 
              className="grid gap-2 mb-4 px-1"
              style={{
                gridTemplateColumns: `50px repeat(${rack.columnas * rack.filas}, 85px)`
              }}
            >
              <div />
              {Array.from({ length: rack.filas }).map((_, fIdx) => {
                const f = fIdx + 1;
                return Array.from({ length: rack.columnas }).map((_, cIdx) => {
                  const c = cIdx + 1;
                  return (
                    <div key={`head-${f}-${c}`} className="text-center font-black uppercase tracking-tighter bg-slate-800/40 py-1 rounded-t-lg border-b border-indigo-500/30">
                      <span className="text-[10px] text-indigo-300">F{f} C{c}</span>
                    </div>
                  );
                });
              })}
            </div>

            <div
              className="grid gap-2 items-center"
              style={{
                gridTemplateColumns: `50px repeat(${rack.columnas * rack.filas}, 85px)`,
                gridTemplateRows: `repeat(${rack.pisos}, 85px)`
              }}
            >
              {Array.from({ length: rack.pisos }).map((_, pRevIdx) => {
                const p = rack.pisos - pRevIdx; // Piso 1 abajo
                return (
                  <React.Fragment key={`piso-row-${p}`}>
                    <div className="flex flex-col items-center justify-center h-full border-r-2 border-indigo-500/50 pr-4 mr-2 sticky left-0 bg-slate-900/90 backdrop-blur-md z-20 rounded-l-lg shadow-2xl border-y border-white/5">
                      <span className="text-xs font-black text-indigo-300 uppercase leading-none mb-1">Piso</span>
                      <span className="text-3xl font-black text-white leading-none tabular-nums drop-shadow-md">{p}</span>
                    </div>

                    {Array.from({ length: rack.filas }).map((_, fIdx) => {
                      const f = fIdx + 1;
                      return Array.from({ length: rack.columnas }).map((_, cIdx) => {
                        const c = cIdx + 1;
                        const espacio = rack.espacios.find((e: any) => e.piso === p && e.columna === c && e.fila === f);

                        return (
                          <div
                            key={`cell-2d-${p}-${c}-${f}`}
                            className={`
                              w-[85px] h-[85px] rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 group relative
                              ${!espacio 
                                ? 'bg-transparent border-dashed border-white/10 opacity-10' 
                                : espacio.ocupado
                                  ? `${getBoatSizeClass(espacio.embarcacion?.eslora || 0)} shadow-lg border-2 ${
                                      highlightedQuery && espacio.embarcacion?.nombre.toLowerCase().includes(highlightedQuery.toLowerCase())
                                      ? 'ring-4 ring-yellow-400 z-10 scale-110 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]'
                                      : ''
                                    }`
                                  : `bg-slate-800/40 border-white/20 hover:border-indigo-400 ${
                                      highlightedQuery && rack.codigo.toLowerCase() === highlightedQuery.toLowerCase()
                                      ? 'border-indigo-500 bg-indigo-500/30'
                                      : ''
                                    }`
                                }
                            `}
                          >
                            {espacio?.ocupado ? (
                              <>
                                <Anchor size={20} className="text-white/80" />
                                <span className="text-[8px] font-black text-center px-1 truncate w-full uppercase text-white leading-tight drop-shadow-sm">
                                  {espacio.embarcacion?.nombre}
                                </span>
                              </>
                            ) : espacio && (
                              <span className="text-[10px] font-black opacity-10 tracking-widest">{p}</span>
                            )}
                            
                            {espacio && (
                              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] bg-black/80 px-1.5 py-0.5 rounded text-indigo-300 font-bold border border-white/5">F{f} C{c}</span>
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
          </>
        )}
      </div>
    </div>
  );
};

export const MapaOcupacion: React.FC<MapaOcupacionProps> = ({ racks, is3D = false, highlightedQuery }) => {
  const navigate = useNavigate();
  const rackRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-scroll to highlighted rack
  useEffect(() => {
    if (highlightedQuery) {
      const rack = racks.find(r => 
        r.codigo.toLowerCase() === highlightedQuery.toLowerCase() ||
        r.espacios.some(e => e.embarcacion?.nombre.toLowerCase().includes(highlightedQuery.toLowerCase()))
      );
      
      if (rack && rackRefs.current[rack.codigo]) {
        rackRefs.current[rack.codigo]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [highlightedQuery, racks]);

  const handleVerDetalle = (codigo: string) => {
    navigate(`/infraestructura/racks/${codigo}`);
  };

  const getBoatSizeClass = (eslora: number) => {
    if (eslora < 6) return 'bg-emerald-500 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
    if (eslora <= 10) return 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]';
    return 'bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]';
  };

  if (!racks || racks.length === 0) {
    return (
      <div className="bg-slate-900/40 p-16 rounded-[3rem] border border-slate-800 flex flex-col items-center gap-6 text-center">
        <div className="bg-slate-800 p-6 rounded-3xl">
          <Box className="w-12 h-12 text-slate-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sin Datos de Infraestructura</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm">No hay racks configurados en este sector. Comienza agregando uno desde la gestión de ubicaciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ${is3D ? 'perspective-container' : ''}`}>
      <div className="grid grid-cols-1 gap-10">
        {racks.map(rack => (
          <div 
            key={rack.id} 
            ref={el => { rackRefs.current[rack.codigo] = el; }}
            className={`group relative bg-slate-900/20 rounded-[4rem] border p-10 transition-all duration-500 shadow-2xl ${
              highlightedQuery && (
                rack.codigo.toLowerCase() === highlightedQuery.toLowerCase() ||
                rack.espacios.some(e => e.embarcacion?.nombre.toLowerCase().includes(highlightedQuery.toLowerCase()))
              )
              ? 'border-indigo-500/50 bg-indigo-500/5 scale-[1.01] ring-1 ring-indigo-500/20'
              : 'border-slate-800/50 hover:bg-slate-900/40'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-4 gap-6">
              <div className="flex items-center gap-6">
                <div className="bg-indigo-600/20 p-5 rounded-[2rem] border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Building2 className="text-indigo-400 w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{rack.codigo}</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <LayoutGrid size={14} className="text-indigo-500" />
                      {rack.columnas} Columnas × {rack.filas} Filas
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium border-l border-slate-700 pl-4">
                      <Layers size={14} className="text-blue-500" />
                      {rack.pisos} Niveles (Alta Densidad)
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleVerDetalle(rack.codigo)}
                  className="px-6 py-3 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center gap-2"
                >
                   Gestión Completa
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <OccupancyRack3DContainer 
              rack={rack} 
              is3D={is3D} 
              getBoatSizeClass={getBoatSizeClass} 
              highlightedQuery={highlightedQuery}
            />

            {/* Quick Metrics Overlay */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 px-4">
              <div className="bg-slate-800/40 p-5 rounded-3xl border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ocupación</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-indigo-400">
                    {Math.round((rack.espacios.filter(e => e.ocupado).length / rack.espacios.length) * 100)}%
                  </span>
                  <TrendingUp size={14} className="text-indigo-500 mb-1.5" />
                </div>
              </div>
              <div className="bg-slate-800/40 p-5 rounded-3xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Libres</p>
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {rack.espacios.filter(e => !e.ocupado).length}
                </span>
              </div>
              <div className="bg-slate-800/40 p-5 rounded-3xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Capacidad</p>
                <span className="text-2xl font-black text-[var(--text-primary)]">{rack.espacios.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
