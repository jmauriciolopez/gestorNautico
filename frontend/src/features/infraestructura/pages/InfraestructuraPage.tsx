import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useUbicaciones } from '../hooks/useUbicaciones';
import {
  Loader2,
  Map as MapIcon,
  Settings,
  Activity,
  ChevronRight
} from 'lucide-react';
import { InfraestructuraStats } from '../components/InfraestructuraStats';
import { MapaOcupacion } from '../components/MapaOcupacion';
import { ConfiguracionZonas } from '../components/ConfiguracionZonas';
import { useEmbarcaciones } from '../../embarcaciones/hooks/useEmbarcaciones';
import { AsignarEmbarcacionModal } from '../components/AsignarEmbarcacionModal';
import { LiberarEspacioModal } from '../components/LiberarEspacioModal';
import { RoleGuard } from '../../../components/auth/RoleGuard';
import { Role } from '../../../types';

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
      toast.success('Ubicación principal creada');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la ubicación');
      console.error(error.message);
    }
  };

  const handleCreateZona = async (data: { nombre: string; ubicacionId: number }) => {
    try {
      await createZona.mutateAsync(data);
      toast.success('Zona registrada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar la zona');
      console.error(error.message);
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
      await createRack.mutateAsync({ ...data, tarifaBase: 0 });
      toast.success(`Rack ${data.codigo} generado con éxito`);
    } catch (error: any) {
      toast.error(error.message || 'Error al generar el rack');
      console.error(error.message);
    }
  };

  const handleUpdateRack = async (id: number, data: any) => {
    try {
      await updateRack.mutateAsync({ id, ...data });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleDeleteRack = async (id: number) => {
    try {
      await deleteRack.mutateAsync(id);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleUpdateZona = async (id: number, data: { nombre: string; ubicacionId: number }) => {
    try {
      await updateZona.mutateAsync({ id, ...data });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleDeleteZona = async (id: number) => {
    try {
      await deleteZona.mutateAsync(id);
    } catch (error: any) {
      console.error(error.message);
    }
  };


  const handleAsignarBarco = async (embarcacionId: number) => {
    if (!selectedSpaceState) return;
    try {
      await updateEmbarcacion.mutateAsync({
        id: embarcacionId,
        data: { espacioId: selectedSpaceState.id }
      });
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      await queryClient.invalidateQueries({ queryKey: ['zonas'] });
      await queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
      toast.success(`Embarcación asignada al espacio ${selectedSpaceState.codigo}`);
      setIsAsignarOpen(false);
      setSelectedSpaceState(null);
    } catch (error: any) {
      toast.error(error.message || 'Error en la asignación del espacio');
      console.error(error.message);
    }
  };

  const handleLiberarEspacio = async (embarcacionId: number | null, nuevoEstado: string) => {
    if (!selectedSpaceState) return;
    try {
      if (embarcacionId) {
        const keepsSpace = nuevoEstado === 'EN_CUNA';

        await updateEmbarcacion.mutateAsync({
          id: embarcacionId,
          data: {
            espacioId: keepsSpace ? selectedSpaceState.id : null,
            estado: nuevoEstado
          }
        });
      } else {
        await updateEspacio.mutateAsync({ id: selectedSpaceState.id, ocupado: false });
      }
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] });
      await queryClient.invalidateQueries({ queryKey: ['zonas'] });
      await queryClient.invalidateQueries({ queryKey: ['infra-stats'] });
      toast.success('Espacio liberado y actualizado correctamente');
      setIsLiberarOpen(false);
      setSelectedSpaceState(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al liberar el espacio');
      console.error(error.message);
    }
  };

  const isLoading = useUbicacionesQuery.isLoading || useZonas.isLoading || getEmbarcaciones.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-primary)]/20 rounded-[2.5rem] border border-[var(--border-primary)]">
        <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
        <p className="mt-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] animate-pulse">Sincronizando Inventario de Espacios...</p>
      </div>
    );
  }

  const stats = useEstadisticas.data || { total: 0, ocupados: 0, libres: 0, porcentajeOcupacion: 0 };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats Section */}
      <InfraestructuraStats stats={stats} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-secondary)]/[0.5] rounded-[2rem] border border-[var(--border-primary)] w-fit shadow-xl transition-colors duration-300">
        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex items-center gap-3 px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mapa' ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
            }`}
        >
          <MapIcon size={16} />
          Mapa de Ocupación
        </button>
        <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-3 px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
              }`}
          >
            <Settings size={16} />
            Parámetros Globales
          </button>
        </RoleGuard>
      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-colors duration-300 min-h-[500px]">
        <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">
                {activeTab === 'mapa' ? 'Libro de Ocupación Estática' : 'Consola de Configuración'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">Control de topología y espacios de guarda</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            <span>Centro de Control</span>
            <ChevronRight className="w-4 h-4 opacity-30" />
          </div>
        </div>

        <div className="p-2 transition-all duration-500">
          {activeTab === 'mapa' ? (
            <MapaOcupacion
              racks={(useUbicacionesQuery.data || []).flatMap(u => u.zonas.flatMap(z => z.racks))}
              is3D={true}
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
      </div>

      {/* Persistent Interaction Modals */}
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
