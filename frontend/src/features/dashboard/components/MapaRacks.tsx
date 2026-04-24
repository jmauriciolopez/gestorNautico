import React, { useState, useRef } from 'react';
import {
  Anchor,
  Maximize2,
  Info,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  LogOut,
  LogIn,
  History,
  Box,
  X
} from 'lucide-react';
import { RackMap } from '../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import { AsignarEmbarcacionModal } from '../../infraestructura/components/AsignarEmbarcacionModal';
import { Embarcacion } from '../../embarcaciones/hooks/useEmbarcaciones';
import { EstadoEmbarcacion, TipoMovimiento } from '../../../shared/types/enums';

interface MapaRacksProps {
  data: RackMap[];
  embarcacionesLibres: Embarcacion[];
  onAsignar: (embarcacionId: number, espacioId: number) => Promise<void>;
  onRegistrarSalida?: (embarcacionId: number, tipo?: TipoMovimiento) => Promise<void>;
  is3D?: boolean;
}

interface Rack3DContainerProps {
  rack: any;
  is3D: boolean;
  setSelectedEspacio: (espacio: any) => void;
}

const getEsloraColor = (eslora: number) => {
  if (eslora > 10) return 'amber';
  if (eslora >= 6) return 'indigo';
  return 'teal';
};

const getEspacioStyle = (espacio: any) => {
  const estado = espacio?.embarcacion?.estado_operativo;
  if (estado === EstadoEmbarcacion.EN_AGUA) {
    return 'bg-[var(--accent-teal-soft)] border-[var(--accent-teal-soft)]';
  }
  if (estado === EstadoEmbarcacion.EN_CUNA || espacio?.ocupado) {
    return 'bg-[var(--accent-indigo-soft)] border-[var(--accent-indigo-soft)]';
  }
  return 'bg-transparent border-white/10';
};

const hasEmbarcacion = (espacio: any) => {
  return espacio?.ocupado || espacio?.embarcacion?.estado_operativo === EstadoEmbarcacion.EN_AGUA;
};

const Rack3DContainer: React.FC<Rack3DContainerProps> = ({ 
  rack, 
  is3D, 
  setSelectedEspacio
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!is3D || !localRef.current) return;
    
    const { left, top, width, height } = localRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    // Sensibilidad ajustada para que el giro se sienta natural sobre el rack
    const rotateY = -25 + (x * 20); 
    const rotateX = 30 - (y * 15);
    
    localRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    localRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!is3D || !localRef.current) return;
    
    // Zoom acumulativo suave
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
      className={`px-4 py-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] bg-black/30 border border-white/5 transition-all duration-700 ${is3D ? 'rack-3d-scene rack-3d-active overflow-visible mb-12' : 'overflow-x-auto custom-scrollbar'}`}
    >
      <div className={is3D ? 'min-w-max' : 'w-full'}>
        {/* Renderizado condicional según modo 2D/3D */}
        {is3D ? (
          /* VISTA 3D: Eje Z = Pisos, Y = Filas, X = Columnas */
          <>
            {/* 3D Column Headers (Hidden/Semi-transparent in 3D scene but present for structure) */}
            <div 
              className="grid gap-3 mb-6 px-1 opacity-0 pointer-events-none"
              style={{
                gridTemplateColumns: `60px repeat(${rack.columnas}, 110px)`
              }}
            >
              <div />
              {Array.from({ length: rack.columnas }).map((_, i) => (
                <div key={i} className="text-center font-black uppercase tracking-widest flex flex-col items-center">
                  <span className="text-xs text-indigo-300 drop-shadow-sm mb-1">Columna</span>
                  <span className="text-base text-white">{i + 1}</span>
                </div>
              ))}
            </div>

            <div
              className="grid gap-3 items-center"
              style={{
                gridTemplateColumns: `60px repeat(${rack.columnas}, 110px)`,
                gridTemplateRows: `repeat(${rack.filas}, 110px)`
              }}
            >
              {Array.from({ length: rack.filas }).map((_, fIdx) => {
                const f = fIdx + 1;
                return (
                  <React.Fragment key={`fila-${f}`}>
                    <div className="flex flex-col items-center justify-center h-full border-r-2 border-indigo-500/50 pr-4 mr-2 sticky left-0 bg-slate-900/90 backdrop-blur-md z-20 rounded-l-2xl shadow-2xl border-y border-white/5">
                      <span className="text-xs font-black text-indigo-300 uppercase tracking-tighter leading-none mb-1">Fila</span>
                      <span className="text-4xl font-black text-white leading-none tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{f}</span>
                    </div>

                    {Array.from({ length: rack.columnas }).map((_, cIdx) => {
                      const c = cIdx + 1;
                      return (
                        <div key={`stack-${f}-${c}`} className="relative h-[110px] w-[110px]">
                          {Array.from({ length: rack.pisos }).map((_, pIdx) => {
                            const p = pIdx + 1;
                            const espacio = rack.espacios.find((e: any) => e.piso === p && e.columna === c && e.fila === f);

                            return (
                              <div
                                key={`cell-${p}-${c}-${f}`}
                                onClick={() => espacio && setSelectedEspacio({
                                  espacioId: espacio.id,
                                  codigo: espacio.numero,
                                  embarcacion: espacio.embarcacion
                                })}
                                  className={`
                                    absolute inset-0 rounded-xl border transition-all duration-700 flex flex-col items-center justify-center gap-1 group/item relative cell-3d
                                    ${!espacio 
                                      ? 'bg-transparent border-dashed border-white/10' 
                                      : hasEmbarcacion(espacio)
                                        ? `${getEspacioStyle(espacio)} cursor-pointer shadow-xl border-2 border-l-4`
                                        : 'bg-slate-800/40 text-slate-500 border-white/20 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer'
                                      }
                                  `}
                                  style={{
                                    transform: `translateZ(${p * 100}px) translateX(${p * 3}px) translateY(-${p * 3}px)`,
                                    zIndex: 20 - p,
                                    borderLeftColor: hasEmbarcacion(espacio) ? `var(--accent-${getEsloraColor(espacio.embarcacion?.eslora)})` : undefined
                                  }}
                              >
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-black opacity-30 text-white tracking-widest uppercase pointer-events-none whitespace-nowrap">
                                  Nivel {p}
                                </div>

                                {espacio && (
                                  <>
                                    <div className="cell-volume-side cell-volume-top" />
                                    <div className="cell-volume-side cell-volume-left" />
                                  </>
                                )}

                                {!espacio ? (
                                  <div className="text-[10px] font-mono opacity-5">N/A</div>
                                ) : hasEmbarcacion(espacio) ? (
                                  <>
                                      <Anchor 
                                        size={24} 
                                        className={(espacio.embarcacion?.eslora || 0) > 10 ? 'animate-pulse' : ''} 
                                        style={{ color: `var(--accent-${getEsloraColor(espacio.embarcacion?.eslora)})` }}
                                      />
                                    <span className="text-[9px] font-black text-center px-1 truncate w-full uppercase tracking-tighter leading-tight text-white/90">
                                      {espacio.embarcacion?.nombre}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-black opacity-20 tracking-widest">{espacio.numero.split('-').pop()}</span>
                                )}

                                {hasEmbarcacion(espacio) && (
                                  <div className="absolute -top-1 -right-1 bg-white text-slate-950 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity z-20 shadow-xl scale-90 group-hover/item:scale-100">
                                    <Info size={12} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : (
          /* VISTA 2D: Eje Y = Pisos (1 abajo), Eje X = (Columnas x Filas) */
          <>
            {/* 2D Column Headers Flattened */}
            <div 
              className="grid gap-3 mb-6 px-1"
              style={{
                gridTemplateColumns: `60px repeat(${rack.columnas * rack.filas}, 110px)`
              }}
            >
              <div />
              {Array.from({ length: rack.filas }).map((_, fIdx) => {
                const f = fIdx + 1;
                return Array.from({ length: rack.columnas }).map((_, cIdx) => {
                  const c = cIdx + 1;
                  return (
                    <div key={`head-${f}-${c}`} className="text-center font-black uppercase tracking-tighter bg-slate-800/40 py-1.5 rounded-t-xl border-b border-indigo-500/30">
                      <span className="text-[10px] text-indigo-300">F{f} C{c}</span>
                    </div>
                  );
                });
              })}
              {/* Floor Rows */}
              {Array.from({ length: rack.pisos }).map((_, pRevIdx) => {
                const p = rack.pisos - pRevIdx;
                return (
                  <React.Fragment key={`piso-row-${p}`}>
                    <div className="flex flex-col items-center justify-center h-[110px] border-r-2 border-indigo-500/50 px-4 md:px-6 sticky left-0 bg-slate-900/95 backdrop-blur-xl z-20 border-y border-white/5 rounded-l-xl shadow-2xl min-w-[70px] md:min-w-[80px]">
                      <span className="text-xs font-black text-indigo-300 uppercase tracking-tighter leading-none mb-1">Piso</span>
                      <span className="text-3xl md:text-4xl font-black text-white leading-none tabular-nums drop-shadow-md">{p}</span>
                    </div>

                    {Array.from({ length: rack.filas }).map((_, fIdx) => {
                      const f = fIdx + 1;
                      return Array.from({ length: rack.columnas }).map((_, cIdx) => {
                        const c = cIdx + 1;
                        const espacio = rack.espacios.find((e: any) => e.piso === p && e.columna === c && e.fila === f);

                        return (
                          <div
                            key={`cell-2d-${p}-${c}-${f}`}
                            onClick={() => espacio && setSelectedEspacio({
                              espacioId: espacio.id,
                              codigo: espacio.numero,
                              embarcacion: espacio.embarcacion
                            })}
                            className={`
                              h-[110px] w-full rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 group/item relative
                              ${!espacio 
                                ? 'bg-transparent border-dashed border-white/10' 
                                : hasEmbarcacion(espacio)
                                  ? `${getEspacioStyle(espacio)} cursor-pointer shadow-xl border-2 border-l-4 hover:brightness-110 active:scale-95`
                                  : 'bg-slate-800/40 text-slate-500 border-white/20 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer active:scale-95'
                                }
                            `}
                            style={{
                              borderLeftColor: hasEmbarcacion(espacio) ? `var(--accent-${getEsloraColor(espacio.embarcacion?.eslora)})` : undefined
                            }}
                          >
                            {!espacio ? (
                              <div className="text-[10px] font-mono opacity-5">N/A</div>
                            ) : hasEmbarcacion(espacio) ? (
                              <>
                                <Anchor 
                                  size={24} 
                                  style={{ color: `var(--accent-${getEsloraColor(espacio.embarcacion?.eslora)})` }}
                                />
                                <span className="text-[10px] font-black text-center px-1 truncate w-full uppercase tracking-tighter leading-tight text-white drop-shadow-sm">
                                  {espacio.embarcacion?.nombre}
                                </span>
                              </>
                            ) : (
                                <span className="text-[10px] font-black opacity-20 tracking-widest">{espacio.numero.split('-').pop()}</span>
                            )}
                            
                            {espacio && (
                              <div className="absolute top-1 left-1 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[6px] bg-black/60 px-1 rounded text-indigo-300 font-black">F{f}C{c}</span>
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

export const MapaRacks: React.FC<MapaRacksProps> = ({ 
  data, 
  embarcacionesLibres, 
  onAsignar,
  onRegistrarSalida,
  is3D = false 
}) => {
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


  return (
    <>
    <div className={`space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ${is3D ? 'perspective-container' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Mapa Maestro de Racks</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Visualización técnica de ocupación por zona y dimensiones.</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 items-center bg-slate-900/60 px-6 py-3.5 rounded-2xl border border-slate-700/50 w-fit shadow-lg">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Leyenda Eslora:</span>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-[0_0_10px_var(--accent-teal-soft)] border border-[var(--accent-teal)]" style={{ background: 'var(--accent-teal)' }} />
            <span className="text-sm text-white font-bold">&lt;6m</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-[0_0_10px_var(--accent-indigo-soft)] border border-[var(--accent-indigo)]" style={{ background: 'var(--accent-indigo)' }} />
            <span className="text-sm text-white font-bold">6-10m</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-[0_0_10px_var(--accent-amber-soft)] border border-[var(--accent-amber)]" style={{ background: 'var(--accent-amber)' }} />
            <span className="text-sm text-white font-bold">&gt;10m</span>
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
                <div className="bg-[var(--accent-indigo-soft)] p-4 rounded-2xl border border-[var(--accent-indigo)]/20">
                  <Maximize2 className="text-[var(--accent-indigo)] w-6 h-6" />
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
              <div className="p-8 pt-0 grid grid-cols-1 gap-10 animate-in slide-in-from-top-4 duration-500">
                {zona.racks.map(rack => (
                  <div key={rack.id} className="space-y-4 min-w-0 w-full overflow-hidden">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-[var(--text-primary)] text-[10px] font-black px-2 py-1 rounded">RACK</span>
                        <h4 className="text-lg font-bold text-[var(--text-primary)]">{rack.codigo}</h4>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">({rack.ancho}x{rack.alto}x{rack.largo}m)</span>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{rack.columnas} col x {rack.filas} filas</span>
                    </div>

                    <Rack3DContainer 
                      rack={rack} 
                      is3D={is3D} 
                      setSelectedEspacio={setSelectedEspacio}
                    />
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
                      <span className="font-semibold text-[var(--text-primary)]">Historial de Operaciones</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      const tipo = selectedEspacio.embarcacion.estado_operativo === EstadoEmbarcacion.EN_AGUA ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA;
                      onRegistrarSalida?.(selectedEspacio.embarcacion.id, tipo);
                      setSelectedEspacio(null);
                    }}
                    className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all group mt-2 ${
                      selectedEspacio.embarcacion.estado_operativo === EstadoEmbarcacion.EN_AGUA
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedEspacio.embarcacion.estado_operativo === EstadoEmbarcacion.EN_AGUA ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {selectedEspacio.embarcacion.estado_operativo === EstadoEmbarcacion.EN_AGUA ? <LogIn size={18} /> : <LogOut size={18} />}
                      </div>
                      <span className="font-bold">
                        {selectedEspacio.embarcacion.estado_operativo === EstadoEmbarcacion.EN_AGUA ? 'Registrar Entrada' : 'Registrar Salida'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
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
