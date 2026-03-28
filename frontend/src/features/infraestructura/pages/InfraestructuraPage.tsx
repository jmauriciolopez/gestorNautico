import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUbicaciones } from '../hooks/useUbicaciones';
import { 
  Loader2, 
  Map as MapIcon,
  Settings
} from 'lucide-react';
import { InfraestructuraStats } from '../components/InfraestructuraStats';
import { MapaOcupacion } from '../components/MapaOcupacion';
import { ConfiguracionZonas } from '../components/ConfiguracionZonas';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { AsignarEmbarcacionModal } from '../components/AsignarEmbarcacionModal';
import { LiberarEspacioModal } from '../components/LiberarEspacioModal';

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

  const { getEmbarcaciones, updateEmbarcacion } = useEmbarcaciones();
  const embarcaciones = getEmbarcaciones.data || [];

  const embarcacionesLibres = embarcaciones.filter((e: any) => !e.espacioId && e.estado !== 'INACTIVA');
  
  const [activeTab, setActiveTab] = useState<'mapa' | 'config'>('mapa');

  // Modal states
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);
  const [isLiberarOpen, setIsLiberarOpen] = useState(false);
  const [selectedSpaceState, setSelectedSpaceState] = useState<{ id: number, codigo: string, embarcacionActual?: any } | null>(null);

  const queryClient = useQueryClient();

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

  const handleEspacioClick = async (id: number, currentOcupado: boolean, numero: string) => {
    if (currentOcupado) {
      const barcoEnLugar = embarcaciones.find((e: any) => e.espacio?.id === id);
      setSelectedSpaceState({ id, codigo: numero, embarcacionActual: barcoEnLugar });
      setIsLiberarOpen(true);
    } else {
      setSelectedSpaceState({ id, codigo: numero });
      setIsAsignarOpen(true);
    }
  };

  const handleAsignarBarco = async (embarcacionId: number) => {
    if (!selectedSpaceState) return;
    try {
      await updateEmbarcacion.mutateAsync({ 
        id: embarcacionId, 
        data: { espacioId: selectedSpaceState.id } 
      });
      // Invalidate ubicaciones query so the map turns RED
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      await queryClient.invalidateQueries({ queryKey: ['zonas'] });
      await queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
      setIsAsignarOpen(false);
      setSelectedSpaceState(null);
    } catch (error: any) {
      alert(error.message || 'Error al asignar embarcación');
    }
  };

  const handleLiberarEspacio = async (embarcacionId: number | null, nuevoEstado: string) => {
    if (!selectedSpaceState) return;
    try {
      if (embarcacionId) {
        const keepsSpace = nuevoEstado !== 'INACTIVA';
        
        await updateEmbarcacion.mutateAsync({ 
          id: embarcacionId, 
          data: { 
            espacioId: keepsSpace ? selectedSpaceState.id : null, 
            estado: nuevoEstado 
          } 
        });
      } else {
        // Fallback for ghost occupation where no vessel is tied
        await updateEspacio.mutateAsync({ id: selectedSpaceState.id, ocupado: false });
      }
      // Invalidate ubicaciones query so the map turns GREEN
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      await queryClient.invalidateQueries({ queryKey: ['zonas'] });
      await queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
      setIsLiberarOpen(false);
      setSelectedSpaceState(null);
    } catch (error: any) {
      alert(error.message || 'Error al liberar el espacio');
    }
  };

  const isLoading = useUbicacionesQuery.isLoading || useZonas.isLoading || getEmbarcaciones.isLoading;

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
          onToggleEspacio={handleEspacioClick} 
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

      {selectedSpaceState && (
        <AsignarEmbarcacionModal
          isOpen={isAsignarOpen}
          onClose={() => { setIsAsignarOpen(false); setSelectedSpaceState(null); }}
          espacioId={selectedSpaceState.id}
          codigoEspacio={selectedSpaceState.codigo}
          embarcacionesLibres={embarcacionesLibres}
          onAsignar={handleAsignarBarco}
        />
      )}

      {selectedSpaceState && (
        <LiberarEspacioModal
          isOpen={isLiberarOpen}
          onClose={() => { setIsLiberarOpen(false); setSelectedSpaceState(null); }}
          espacioId={selectedSpaceState.id}
          codigoEspacio={selectedSpaceState.codigo}
          embarcacionEnElLugar={selectedSpaceState.embarcacionActual}
          onLiberar={handleLiberarEspacio}
        />
      )}
    </div>
  );
}
