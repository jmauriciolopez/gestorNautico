import { useState } from 'react';
import { Layers, Plus, Loader2, Grid2X2 } from 'lucide-react';

interface Zona {
  id: number;
  nombre: string;
}

interface ConfiguracionZonasProps {
  zonas: Zona[];
  onCreateZona: (nombre: string) => Promise<void>;
  onCreateRack: (data: { zonaId: number; codigo: string; numEspacios: number }) => Promise<void>;
  isCreatingZona: boolean;
  isCreatingRack: boolean;
}

export function ConfiguracionZonas({ 
  zonas, 
  onCreateZona, 
  onCreateRack, 
  isCreatingZona, 
  isCreatingRack 
}: ConfiguracionZonasProps) {
  const [newZonaNombre, setNewZonaNombre] = useState('');
  const [newRack, setNewRack] = useState({ zonaId: 0, codigo: '', numEspacios: 10 });

  const handleCreateZona = async () => {
    if (!newZonaNombre) return;
    await onCreateZona(newZonaNombre);
    setNewZonaNombre('');
  };

  const handleCreateRack = async () => {
    if (!newRack.zonaId || !newRack.codigo) return;
    await onCreateRack(newRack);
    setNewRack({ ...newRack, codigo: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuración de Zonas */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-800 pb-4">
          <Layers className="text-blue-500" />
          Nueva Zona Operativa
        </h3>
        <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre de la Zona</label>
            <input 
              type="text" 
              value={newZonaNombre}
              onChange={(e) => setNewZonaNombre(e.target.value)}
              placeholder="Ej: Galpón Principal, Muelle 1"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleCreateZona}
            disabled={!newZonaNombre || isCreatingZona}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex justify-center gap-2 items-center"
          >
            {isCreatingZona ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Registrar Zona
          </button>
        </div>
      </div>

      {/* Configuración de Racks */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-800 pb-4">
          <Grid2X2 className="text-purple-500" />
          Agregar Rack a Zona
        </h3>
        <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Seleccionar Zona</label>
            <select 
              value={newRack.zonaId}
              onChange={(e) => setNewRack({ ...newRack, zonaId: +e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-white transition-all outline-none"
            >
              <option value={0}>Elegir una zona...</option>
              {zonas.map(zona => (
                <option key={zona.id} value={zona.id}>{zona.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Código (Ej: A1)</label>
              <input 
                type="text" 
                value={newRack.codigo}
                onChange={(e) => setNewRack({ ...newRack, codigo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nº Espacios</label>
              <input 
                type="number" 
                value={newRack.numEspacios}
                onChange={(e) => setNewRack({ ...newRack, numEspacios: +e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-white outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleCreateRack}
            disabled={!newRack.zonaId || !newRack.codigo || isCreatingRack}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex justify-center gap-2 items-center"
          >
            {isCreatingRack ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Generar Rack y Espacios
          </button>
        </div>
      </div>
    </div>
  );
}
