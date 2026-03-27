import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';

export default function ClientesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { getClientes, deleteCliente } = useClientes();
  const { data: clientes = [], isLoading, isError } = getClientes;

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente (desactivar)?')) {
      await deleteCliente.mutateAsync(id);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.dni.includes(search)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 animate-pulse">Cargando clientes de la base de datos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center space-y-4">
        <p className="text-rose-700 font-medium">Hubo un error al conectar con el servidor.</p>
        <button 
          onClick={() => getClientes.refetch()}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <p className="text-gray-500 mt-1">Gestión de base de datos de clientes.</p>
        </div>
        <Link 
          to="/clientes/nuevo" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">DNI/Documento</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className={`hover:bg-gray-50 transition ${!cliente.activo ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-800">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.dni}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    <div>{cliente.email || 'Sin email'}</div>
                    <div className="text-gray-400 mt-0.5">{cliente.telefono || 'Sin teléfono'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      cliente.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cliente.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" 
                      title="Eliminar"
                      disabled={deleteCliente.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron clientes coincidiendo con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
