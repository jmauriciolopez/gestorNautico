import { useState } from 'react';
import { Grid2X2, AlertCircle, Layers, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { Ubicacion } from '../hooks/useUbicaciones';

interface MapaOcupacionProps {
  ubicaciones: Ubicacion[];
  onToggleEspacio: (id: number, currentOcupado: boolean, numero: string) => void;
}

export function MapaOcupacion({ ubicaciones, onToggleEspacio }: MapaOcupacionProps) {
  const [expandedUbicacion, setExpandedUbicacion] = useState<number | null>(
    ubicaciones.length > 0 ? ubicaciones[0].id : null
  );

  if (ubicaciones.length === 0) {
    return (
      <div className="py-24 text-center animate-in fade-in zoom-in duration-500">
        <MapPin className="mx-auto w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-400">No se ha creado ninguna ubicación</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">Vaya a la pestaña de configuración para iniciar la estructura jerárquica.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {ubicaciones.map(ubicacion => (
        <div key={ubicacion.id} className="space-y-6">
          {/* Ubicación Header */}
          <button 
            onClick={() => setExpandedUbicacion(expandedUbicacion === ubicacion.id ? null : ubicacion.id)}
            className="w-full text-left bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${expandedUbicacion === ubicacion.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'}`}>
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{ubicacion.nombre}</h3>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{ubicacion.zonas?.length || 0} Zonas Operativas</p>
              </div>
            </div>
            {expandedUbicacion === ubicacion.id ? <ChevronDown className="text-slate-600" /> : <ChevronRight className="text-slate-600" />}
          </button>

          {expandedUbicacion === ubicacion.id && (
            <div className="pl-4 md:pl-10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {(ubicacion.zonas || []).map(zona => (
                <div key={zona.id} className="space-y-6">
                  <h4 className="text-lg font-bold text-blue-400 flex items-center gap-3">
                    <Layers size={18} />
                    {zona.nombre}
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-tighter">
                      {zona.racks?.length || 0} racks
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {(zona.racks || []).map(rack => (
                      <div key={rack.id} className="bg-slate-950/40 border border-slate-800/80 rounded-[2rem] p-8 group/rack hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/rack:opacity-20 transition-opacity">
                          <Grid2X2 size={80} />
                        </div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover/rack:bg-blue-600 group-hover/rack:border-blue-400 transition-all duration-500 shadow-lg">
                              <Grid2X2 size={24} className="text-blue-400 group-hover/rack:text-white" />
                            </div>
                            <span className="font-black text-xl text-white tracking-tighter italic uppercase">Rack {rack.codigo}</span>
                          </div>
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full shadow-inner">{rack.espacios?.length || 0} espacios</span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 relative z-10">
                          {([...(rack.espacios || [])].sort((a, b) => a.id - b.id)).map(espacio => (
                            <button
                              key={espacio.id}
                              onClick={() => onToggleEspacio(espacio.id, espacio.ocupado, espacio.numero)}
                              className={`
                                aspect-square rounded-xl flex items-center justify-center transition-all duration-300 border-2 relative group/item
                                ${espacio.ocupado 
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-lg shadow-rose-500/5' 
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5'}
                              `}
                              title={`Espacio ${espacio.numero}`}
                            >
                              <span className="text-xs font-black z-10 tracking-tighter">{espacio.numero.split('-')[1] || espacio.numero}</span>
                              {espacio.ocupado ? 
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50" /> : 
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                              }
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {(!zona.racks || zona.racks.length === 0) && (
                      <div className="col-span-full py-16 text-center bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800/50">
                        <AlertCircle className="mx-auto w-10 h-10 text-slate-700 mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Esta zona no tiene racks configurados</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!ubicacion.zonas || ubicacion.zonas.length === 0) && (
                <div className="py-16 text-center bg-slate-900/20 rounded-[2rem] border border-slate-800/50">
                  <Layers className="mx-auto w-10 h-10 text-slate-800 mb-4" />
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Sin zonas registradas en esta sede</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
