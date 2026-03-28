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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Clientes</h2>
          <p className="text-slate-300 mt-2 font-medium">Gestión de base de datos de clientes y contactos.</p>
        </div>
        <Link 
          to="/clientes/nuevo" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </Link>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-4 bg-slate-900/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white placeholder-slate-600 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-800/60">
              <tr>
                <th className="px-8 py-5">Nombre</th>
                <th className="px-8 py-5">DNI/Documento</th>
                <th className="px-8 py-5">Contacto</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className={`hover:bg-blue-500/5 transition-colors group ${!cliente.activo ? 'opacity-50' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{cliente.nombre}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded text-xs">{cliente.dni}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-slate-200 font-medium">{cliente.email || <span className="text-slate-600 italic">Sin email</span>}</div>
                    <div className="text-slate-400 mt-1 flex items-center gap-2">{cliente.telefono || 'Sin teléfono'}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cliente.activo 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-3">
                    <button 
                      onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all active:scale-90" 
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cliente.id)}
                      className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all active:scale-90" 
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
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Search className="w-12 h-12 text-slate-700" />
                      <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        No se encontraron clientes que coincidan con su búsqueda.
                      </p>
                    </div>
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
