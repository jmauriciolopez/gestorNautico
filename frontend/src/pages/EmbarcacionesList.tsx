import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Ship, Loader2 } from 'lucide-react';
import { useEmbarcaciones } from '../hooks/useEmbarcaciones';

export default function EmbarcacionesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { getEmbarcaciones, deleteEmbarcacion } = useEmbarcaciones();
  const { data: embarcaciones = [], isLoading, isError } = getEmbarcaciones;

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar esta embarcación?')) {
      await deleteEmbarcacion.mutateAsync(id);
    }
  };

  const filtered = embarcaciones.filter(e => 
    e.nombre.toLowerCase().includes(search.toLowerCase()) || 
    e.matricula.toLowerCase().includes(search.toLowerCase()) ||
    e.cliente?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 animate-pulse">Cargando flota de embarcaciones...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center space-y-4">
        <p className="text-rose-700 font-medium">Error al cargar las embarcaciones.</p>
        <button 
          onClick={() => getEmbarcaciones.refetch()}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Embarcaciones</h2>
          <p className="text-gray-500 mt-1">Gestión de flota y estado actual.</p>
        </div>
        <Link 
          to="/embarcaciones/nueva" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Embarcación</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por nombre, matrícula o cliente..."
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
                <th className="px-6 py-4 font-medium">Embarcación</th>
                <th className="px-6 py-4 font-medium">Dimensiones</th>
                <th className="px-6 py-4 font-medium">Cliente (Dueño)</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((emb) => (
                <tr key={emb.id} className={`hover:bg-gray-50 transition ${emb.estado === 'INACTIVA' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{emb.nombre}</div>
                        <div className="text-gray-500 text-xs">{emb.matricula} • {emb.tipo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {emb.eslora}m x {emb.manga}m
                  </td>
                  <td className="px-6 py-4 text-indigo-600 font-medium hover:underline cursor-pointer" onClick={() => navigate(`/clientes/editar/${emb.cliente?.id}`)}>
                    {emb.cliente?.nombre || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      emb.estado === 'EN_CUNA' ? 'bg-amber-100 text-amber-700' :
                      emb.estado === 'EN_AGUA' ? 'bg-blue-100 text-blue-700' :
                      emb.estado === 'MANTENIMIENTO' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {emb.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => navigate(`/embarcaciones/editar/${emb.id}`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(emb.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" 
                      title="Eliminar"
                      disabled={deleteEmbarcacion.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron embarcaciones.
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
