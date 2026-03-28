import { useState } from 'react';
import { useUbicaciones } from '../hooks/useUbicaciones';
import { 
  Plus, 
  Loader2, 
  Map as MapIcon
} from 'lucide-react';
import { InfraestructuraStats } from '../components/InfraestructuraStats';
import { MapaOcupacion } from '../components/MapaOcupacion';
import { ConfiguracionZonas } from '../components/ConfiguracionZonas';

export default function InfraestructuraPage() {
  const { getZonas, getEstadisticas, createZona, createRack, updateEspacio } = useUbicaciones();
  const [activeTab, setActiveTab] = useState<'mapa' | 'config'>('mapa');

  const handleCreateZona = async (nombre: string) => {
    await createZona.mutateAsync(nombre);
  };

  const handleCreateRack = async (data: { zonaId: number; codigo: string; numEspacios: number }) => {
    await createRack.mutateAsync(data);
  };

  const toggleEspacio = async (id: number, currentOcupado: boolean) => {
    await updateEspacio.mutateAsync({ id, ocupado: !currentOcupado });
  };

  if (getZonas.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 animate-pulse font-medium">Cargando infraestructura...</p>
      </div>
    );
  }

  const stats = getEstadisticas.data || { total: 0, ocupados: 0, libres: 0, porcentajeOcupacion: 0 };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <InfraestructuraStats stats={stats} />

      {/* Tabs Nav */}
      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800/50 max-w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('mapa')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm ${
            activeTab === 'mapa' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <MapIcon size={18} />
          Mapa de Ocupación
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm ${
            activeTab === 'config' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Plus size={18} />
          Configuración
        </button>
      </div>

      {activeTab === 'mapa' ? (
        <MapaOcupacion 
          zonas={getZonas.data || []} 
          onToggleEspacio={toggleEspacio} 
        />
      ) : (
        <ConfiguracionZonas 
          zonas={getZonas.data || []}
          onCreateZona={handleCreateZona}
          onCreateRack={handleCreateRack}
          isCreatingZona={createZona.isPending}
          isCreatingRack={createRack.isPending}
        />
      )}
    </div>
  );
}
