import { useState } from 'react';
import { useUbicaciones } from '../hooks/useUbicaciones';
import { 
  Loader2, 
  Map as MapIcon,
  Settings
} from 'lucide-react';
import { InfraestructuraStats } from '../components/InfraestructuraStats';
import { MapaOcupacion } from '../components/MapaOcupacion';
import { ConfiguracionZonas } from '../components/ConfiguracionZonas';

export default function InfraestructuraPage() {
  const { 
    useUbicacionesQuery, 
    useZonas, 
    useEstadisticas, 
    createUbicacion, 
    createZona, 
    updateZona,
    deleteZona,
    createRack, 
    updateRack,
    deleteRack,
    updateEspacio 
  } = useUbicaciones();
  
  const [activeTab, setActiveTab] = useState<'mapa' | 'config'>('mapa');

  const handleCreateUbicacion = async (data: { nombre: string; descripcion?: string }) => {
    try {
      await createUbicacion.mutateAsync(data);
    } catch (error: any) {
      alert(error.message || 'Error al crear ubicación');
    }
  };

  const handleCreateZona = async (data: { nombre: string; ubicacionId: number }) => {
    try {
      await createZona.mutateAsync(data);
    } catch (error: any) {
      alert(error.message || 'Error al crear zona');
    }
  };

  const handleCreateRack = async (data: { 
    zonaId: number; 
    codigo: string; 
    pisos: number;
    filas: number; 
    columnas: number;
    alto: number;
    ancho: number;
    largo: number;
  }) => {
    try {
      await createRack.mutateAsync(data);
    } catch (error: any) {
      alert(error.message || 'Error al crear rack');
    }
  };

  const handleUpdateRack = async (id: number, data: any) => {
    try {
      await updateRack.mutateAsync({ id, ...data });
    } catch (error: any) {
      alert(error.message || 'Error al actualizar rack');
    }
  };

  const handleDeleteRack = async (id: number) => {
    try {
      await deleteRack.mutateAsync(id);
    } catch (error: any) {
      alert(error.message || 'Error al eliminar rack');
    }
  };

  const handleUpdateZona = async (id: number, data: { nombre: string; ubicacionId: number }) => {
    try {
      await updateZona.mutateAsync({ id, ...data });
    } catch (error: any) {
      alert(error.message || 'Error al actualizar zona');
    }
  };

  const handleDeleteZona = async (id: number) => {
    try {
      await deleteZona.mutateAsync(id);
    } catch (error: any) {
      alert(error.message || 'Error al eliminar zona');
    }
  };

  const toggleEspacio = async (id: number, currentOcupado: boolean) => {
    try {
      await updateEspacio.mutateAsync({ id, ocupado: !currentOcupado });
    } catch (error: any) {
      alert(error.message || 'Error al actualizar espacio');
    }
  };

  const isLoading = useUbicacionesQuery.isLoading || useZonas.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 animate-pulse font-medium">Cargando infraestructura...</p>
      </div>
    );
  }

  const stats = useEstadisticas.data || { total: 0, ocupados: 0, libres: 0, porcentajeOcupacion: 0 };

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
          <Settings size={18} />
          Configuración
        </button>
      </div>

      {activeTab === 'mapa' ? (
        <MapaOcupacion 
          ubicaciones={useUbicacionesQuery.data || []} 
          onToggleEspacio={toggleEspacio} 
        />
      ) : (
        <ConfiguracionZonas 
          ubicaciones={useUbicacionesQuery.data || []}
          zonas={useZonas.data || []}
          onCreateUbicacion={handleCreateUbicacion}
          onCreateZona={handleCreateZona}
          onUpdateZona={handleUpdateZona}
          onDeleteZona={handleDeleteZona}
          onCreateRack={handleCreateRack}
          onUpdateRack={handleUpdateRack}
          onDeleteRack={handleDeleteRack}
          isCreatingUbicacion={createUbicacion.isPending}
          isCreatingZona={createZona.isPending}
          isUpdatingZona={updateZona.isPending}
          isCreatingRack={createRack.isPending}
          isUpdatingRack={updateRack.isPending}
        />
      )}
    </div>
  );
}
