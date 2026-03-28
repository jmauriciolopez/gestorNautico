import { useState } from 'react';
import { Wrench, Plus, BookOpen } from 'lucide-react';
import { useServicios } from '../hooks/useServicios';
import { CatalogoList } from '../components/CatalogoList';
import { RegistrosList } from '../components/RegistrosList';
import { NuevoServicioModal } from '../components/NuevoServicioModal';
import { NuevoRegistroModal } from '../components/NuevoRegistroModal';
import { ServicioCatalogo, RegistroServicio } from '../hooks/useServicios';

type Tab = 'registros' | 'catalogo';

export default function ServiciosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('registros');
  const [isServicioModalOpen, setIsServicioModalOpen] = useState(false);
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<ServicioCatalogo | null>(null);

  const { 
    getCatalogo, 
    getRegistros, 
    completeRegistro, 
    deleteServicioCatalogo,
    createServicioCatalogo,
    updateServicioCatalogo,
    createRegistro,
    updateRegistro,
    deleteRegistro
  } = useServicios();

  const handleComplete = async (id: number) => {
    if (window.confirm('¿Marcar este servicio como completado?')) {
      await completeRegistro.mutateAsync({ id });
    }
  };

  const handleDeleteCatalogo = async (id: number) => {
    if (window.confirm('¿Eliminar este servicio del catálogo?')) {
      await deleteServicioCatalogo.mutateAsync(id);
    }
  };

  const handleSaveServicio = async (data: Partial<ServicioCatalogo>) => {
    if (editingServicio) {
      await updateServicioCatalogo.mutateAsync({ id: editingServicio.id, data });
    } else {
      await createServicioCatalogo.mutateAsync(data);
    }
    setEditingServicio(null);
  };

  const handleSaveRegistro = async (data: Partial<RegistroServicio> & { embarcacionId: number; servicioId: number }) => {
    await createRegistro.mutateAsync(data);
  };

  const handleUpdateRegistroStatus = async (id: number, estado: RegistroServicio['estado']) => {
    await updateRegistro.mutateAsync({ id, data: { estado } });
  };

  const handleDeleteRegistro = async (id: number) => {
    if (window.confirm('¿Eliminar este registro de servicio?')) {
      await deleteRegistro.mutateAsync(id);
    }
  };

  const handleOpenCreate = () => {
    if (activeTab === 'registros') {
      setIsRegistroModalOpen(true);
    } else {
      setEditingServicio(null);
      setIsServicioModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Servicios</h2>
          <p className="text-gray-500 mt-1">Catálogo de servicios y registro de trabajos en embarcaciones.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'registros' ? 'Nuevo Registro' : 'Nuevo Servicio'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('registros')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'registros' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Trabajos Registrados
          </div>
          {activeTab === 'registros' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'catalogo' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Catálogo de Servicios
          </div>
          {activeTab === 'catalogo' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'registros' ? (
        <RegistrosList
          registros={getRegistros.data || []}
          isLoading={getRegistros.isLoading}
          onComplete={handleComplete}
          onUpdateStatus={handleUpdateRegistroStatus}
          onDelete={handleDeleteRegistro}
        />
      ) : (
        <CatalogoList
          servicios={getCatalogo.data || []}
          isLoading={getCatalogo.isLoading}
          onDelete={handleDeleteCatalogo}
          onEdit={(svc: ServicioCatalogo) => {
            setEditingServicio(svc);
            setIsServicioModalOpen(true);
          }}
        />
      )}

      <NuevoServicioModal
        isOpen={isServicioModalOpen}
        onClose={() => {
          setIsServicioModalOpen(false);
          setEditingServicio(null);
        }}
        onSave={handleSaveServicio}
        initialData={editingServicio}
      />

      <NuevoRegistroModal
        isOpen={isRegistroModalOpen}
        onClose={() => setIsRegistroModalOpen(false)}
        onSave={handleSaveRegistro}
      />
    </div>
  );
}
