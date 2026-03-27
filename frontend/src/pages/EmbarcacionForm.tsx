import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useEmbarcaciones } from '../hooks/useEmbarcaciones';
import { useClientes } from '../hooks/useClientes';

export default function EmbarcacionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { getEmbarcacion, createEmbarcacion, updateEmbarcacion } = useEmbarcaciones();
  const { getClientes } = useClientes();
  
  const embarcacionQuery = getEmbarcacion(Number(id));
  const { data: embarcacion, isLoading: isFetchingEmb } = embarcacionQuery;
  const { data: clientes = [], isLoading: isFetchingClientes } = getClientes;

  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    eslora: '',
    manga: '',
    tipo: 'Lancha',
    clienteId: '',
    estado: 'EN_CUNA'
  });

  // Sync data when editing
  useEffect(() => {
    if (isEditing && embarcacion) {
      setFormData({
        nombre: embarcacion.nombre || '',
        matricula: embarcacion.matricula || '',
        eslora: String(embarcacion.eslora || ''),
        manga: String(embarcacion.manga || ''),
        tipo: embarcacion.tipo || 'Lancha',
        clienteId: String(embarcacion.cliente?.id || ''),
        estado: embarcacion.estado || 'EN_CUNA'
      });
    }
  }, [isEditing, embarcacion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      eslora: parseFloat(formData.eslora),
      manga: parseFloat(formData.manga),
      clienteId: parseInt(formData.clienteId)
    };

    try {
      if (isEditing) {
        await updateEmbarcacion.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createEmbarcacion.mutateAsync(payload);
      }
      navigate('/embarcaciones');
    } catch (error) {
      console.error('Error saving embarcacion:', error);
      alert('Hubo un error al guardar la embarcación. Verifique los datos.');
    }
  };

  if (isEditing && isFetchingEmb) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-gray-500">Cargando datos de la embarcación...</p>
      </div>
    );
  }

  const isPending = createEmbarcacion.isPending || updateEmbarcacion.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/embarcaciones" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Embarcación' : 'Registrar Embarcación'}
          </h2>
          <p className="text-gray-500 mt-1">Completa los datos técnicos y de titularidad.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre de la Embarcación *</label>
              <input 
                type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: La Bestia"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Matrícula (REY) *</label>
              <input 
                type="text" name="matricula" value={formData.matricula} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="REY-1234"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo *</label>
              <select 
                name="tipo" value={formData.tipo} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Lancha">Lancha</option>
                <option value="Crucero">Crucero</option>
                <option value="Velero">Velero</option>
                <option value="Moto de Agua">Moto de Agua</option>
                <option value="Bote">Bote Recreativo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cliente (Propietario) *</label>
              <select 
                name="clienteId" value={formData.clienteId} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isFetchingClientes}
              >
                <option value="">{isFetchingClientes ? 'Cargando clientes...' : 'Seleccione un cliente...'}</option>
                {clientes.filter(c => c.activo).map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} ({cliente.dni})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Eslora (Metros)</label>
              <input 
                type="number" step="0.01" name="eslora" value={formData.eslora} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: 5.50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Manga (Metros)</label>
              <input 
                type="number" step="0.01" name="manga" value={formData.manga} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: 2.10"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estado Actual</label>
              <select 
                name="estado" value={formData.estado} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="EN_CUNA">En Cuna / Guardería</option>
                <option value="EN_AGUA">En el Agua</option>
                <option value="MANTENIMIENTO">En Mantenimiento</option>
                <option value="INACTIVA">Inactiva / Retirada</option>
              </select>
            </div>
            
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link to="/embarcaciones" className="px-5 py-2 text-gray-600 font-medium bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 text-white font-medium bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Guardar Cambios' : 'Registrar Embarcación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
