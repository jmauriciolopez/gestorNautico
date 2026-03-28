import { Grid2X2, CheckCircle2, Circle, AlertCircle, Layers } from 'lucide-react';

interface Espacio {
  id: number;
  numero: string;
  ocupado: boolean;
}

interface Rack {
  id: number;
  codigo: string;
  espacios: Espacio[];
}

interface Zona {
  id: number;
  nombre: string;
  racks: Rack[];
}

interface MapaOcupacionProps {
  zonas: Zona[];
  onToggleEspacio: (id: number, currentOcupado: boolean) => void;
}

export function MapaOcupacion({ zonas, onToggleEspacio }: MapaOcupacionProps) {
  return (
    <div className="space-y-10">
      {zonas.map(zona => (
        <div key={zona.id} className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-l-4 border-blue-500 pl-4">
            {zona.nombre}
            <span className="text-xs font-normal text-slate-400 ml-2 uppercase tracking-widest">{zona.racks.length} Racks</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {zona.racks.map(rack => (
              <div key={rack.id} className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-300 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 transition-colors">
                      <Grid2X2 size={20} className="text-blue-400 group-hover:text-white" />
                    </div>
                    <span className="tracking-tight text-lg">Rack {rack.codigo}</span>
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">{rack.espacios.length} espacios</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {rack.espacios.map(espacio => (
                    <button
                      key={espacio.id}
                      onClick={() => onToggleEspacio(espacio.id, espacio.ocupado)}
                      className={`
                        aspect-square rounded-xl flex items-center justify-center transition-all duration-300 border relative group/item
                        ${espacio.ocupado 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 shadow-lg shadow-rose-500/5' 
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/5'}
                      `}
                      title={espacio.numero}
                    >
                      <span className="text-[10px] font-bold z-10">{espacio.numero.split('-')[1]}</span>
                      {espacio.ocupado ? <CheckCircle2 size={12} className="absolute top-1 right-1 opacity-60" /> : <Circle size={8} className="absolute top-1 right-1 opacity-40" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {zona.racks.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800/50">
                <AlertCircle className="mx-auto w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium italic">Esta zona aún no tiene racks configurados.</p>
              </div>
            )}
          </div>
        </div>
      ))}
      {zonas.length === 0 && (
        <div className="py-24 text-center">
          <Layers className="mx-auto w-16 h-16 text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-slate-400">No se ha creado ninguna zona operativa</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">Vaya a la pestaña de configuración para iniciar la estructura de su guardería.</p>
        </div>
      )}
    </div>
  );
}
