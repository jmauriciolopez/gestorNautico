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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Embarcaciones</h2>
          <p className="text-slate-300 mt-2 font-medium">Gestión de flota, ubicación y estado operativo.</p>
        </div>
        <Link 
          to="/embarcaciones/nueva" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Embarcación</span>
        </Link>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-4 bg-slate-900/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por nombre, matrícula o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white placeholder-slate-600 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-slate-950/50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-800/60">
              <tr>
                <th className="px-8 py-5">Embarcación</th>
                <th className="px-8 py-5">Dimensiones</th>
                <th className="px-8 py-5">Propietario</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {filtered.map((emb) => (
                <tr key={emb.id} className={`hover:bg-blue-500/5 transition-colors group ${emb.estado === 'INACTIVA' ? 'opacity-50' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600/10 text-blue-400 p-3 rounded-xl border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-base">{emb.nombre}</div>
                        <div className="text-slate-400 text-xs mt-0.5 font-medium">{emb.matricula} • {emb.tipo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-slate-200 font-mono text-xs bg-slate-800/50 px-3 py-1.5 rounded-lg inline-block border border-slate-700/50">
                      {emb.eslora}m <span className="text-slate-500">x</span> {emb.manga}m
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => navigate(`/clientes/editar/${emb.cliente?.id}`)}
                      className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                    >
                      {emb.cliente?.nombre || 'Sin asignar'}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      emb.estado === 'EN_CUNA' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      emb.estado === 'EN_AGUA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      emb.estado === 'MANTENIMIENTO' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {emb.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-3">
                    <button 
                      onClick={() => navigate(`/embarcaciones/editar/${emb.id}`)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all active:scale-90" 
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(emb.id)}
                      className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all active:scale-90" 
                      title="Desactivar"
                      disabled={deleteEmbarcacion.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Ship className="w-12 h-12 text-slate-700" />
                      <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        No se encontraron embarcaciones que coincidan con su búsqueda.
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
