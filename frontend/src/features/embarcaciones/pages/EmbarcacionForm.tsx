import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useEmbarcaciones } from '../hooks/useEmbarcaciones';
import { useClientes } from '../../clientes/hooks/useClientes';

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
    espacioId: '',
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
        espacioId: String(embarcacion.espacio?.id || ''),
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
      eslora: parseFloat(formData.eslora) || 0,
      manga: parseFloat(formData.manga) || 0,
      clienteId: formData.clienteId ? parseInt(formData.clienteId) : null,
      espacioId: formData.espacioId ? parseInt(formData.espacioId) : null
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
    <div className="max-w-4xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6">
        <Link to="/embarcaciones" className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isEditing ? 'Editar Embarcación' : 'Registrar Embarcación'}
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Completa los datos técnicos y de titularidad de la unidad.</p>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -z-10" />
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre de la Embarcación *</label>
              <input 
                type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white placeholder-slate-600 transition-all font-bold"
                placeholder="Ej: La Bestia"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Matrícula (REY) *</label>
              <input 
                type="text" name="matricula" value={formData.matricula} onChange={handleChange} required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white placeholder-slate-600 transition-all font-mono"
                placeholder="REY-1234"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo *</label>
              <select 
                name="tipo" value={formData.tipo} onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white transition-all font-medium appearance-none"
              >
                <option value="Lancha">Lancha</option>
                <option value="Crucero">Crucero</option>
                <option value="Velero">Velero</option>
                <option value="Moto de Agua">Moto de Agua</option>
                <option value="Bote">Bote Recreativo</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Propietario *</label>
              <select 
                name="clienteId" value={formData.clienteId} onChange={handleChange} required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white transition-all font-bold appearance-none"
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

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Eslora (Metros)</label>
              <input 
                type="number" step="0.01" name="eslora" value={formData.eslora} onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white transition-all font-mono"
                placeholder="Ej: 5.50"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Manga (Metros)</label>
              <input 
                type="number" step="0.01" name="manga" value={formData.manga} onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-white transition-all font-mono"
                placeholder="Ej: 2.10"
              />
            </div>

            <div className="space-y-3 col-span-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Estado Operativo Actual</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {['EN_CUNA', 'EN_AGUA', 'MANTENIMIENTO', 'INACTIVA'].map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => setFormData({ ...formData, estado })}
                    className={`px-4 py-3 rounded-xl border font-bold text-xs transition-all ${
                      formData.estado === estado 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {estado.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
          </div>

          <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-800/60">
            <Link 
              to="/embarcaciones" 
              className="px-8 py-4 text-slate-400 font-bold bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:text-white transition-all active:scale-95 shadow-lg"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={isPending}
              className="flex items-center gap-3 px-10 py-4 text-white font-bold bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEditing ? 'Guardar Cambios' : 'Registrar Embarcación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
