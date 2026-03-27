import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';

export default function ClienteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { getCliente, createCliente, updateCliente } = useClientes();
  
  const clienteQuery = getCliente(Number(id));
  const { data: cliente, isLoading: isFetching } = clienteQuery;

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    activo: true
  });

  // Sync data when editing
  useEffect(() => {
    if (isEditing && cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        dni: cliente.dni || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        activo: cliente.activo ?? true
      });
    }
  }, [isEditing, cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? isChecked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCliente.mutateAsync({ id: Number(id), data: formData });
      } else {
        await createCliente.mutateAsync(formData);
      }
      navigate('/clientes');
    } catch (error) {
      console.error('Error saving cliente:', error);
      alert('Hubo un error al guardar el cliente. Verifique los datos.');
    }
  };

  if (isEditing && isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-gray-500">Cargando datos del cliente...</p>
      </div>
    );
  }

  const isPending = createCliente.isPending || updateCliente.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/clientes" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Modifica los datos del cliente seleccionado.' : 'Completa el formulario para registrar un cliente nuevo.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI / Documento *</label>
              <input 
                type="text" 
                id="dni" 
                name="dni" 
                value={formData.dni}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: 12345678"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input 
                type="tel" 
                id="telefono" 
                name="telefono" 
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+54 11 1234-5678"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded bg-gray-100 border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Cliente Activo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 pl-6">
              Los clientes inactivos no aparecerán en las selecciones rápidas ni facturación automática.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link 
              to="/clientes" 
              className="px-5 py-2 text-gray-600 font-medium bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 text-white font-medium bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
