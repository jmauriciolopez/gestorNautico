import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react';
import { useEmbarcaciones } from '../hooks/useEmbarcaciones';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useUbicaciones } from '../../infraestructura/hooks/useUbicaciones';
import UbicacionPickerModal from '../components/UbicacionPickerModal';
import { queryClient } from '../../../api/queryClient';

export default function EmbarcacionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { useEmbarcacion, createEmbarcacion, updateEmbarcacion } = useEmbarcaciones();
  const { getClientes } = useClientes();
  const { useZonas } = useUbicaciones();

  const embarcacionQuery = useEmbarcacion(Number(id));
  const { data: embarcacion, isLoading: isFetchingEmb } = embarcacionQuery;
  const { data: clientes = [], isLoading: isFetchingClientes } = getClientes;
  const { data: zonas = [], isLoading: isFetchingZonas } = useZonas;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    eslora: '',
    manga: '',
    tipo: 'Lancha',
    clienteId: '',
    espacioId: '',
    estado: 'EN_CUNA',
    descuento: '0'
  });

  // Calculate selected space label
  const selectedEspacioLabel = useMemo(() => {
    if (!formData.espacioId) return null;
    let label = '';
    zonas.forEach(z => z.racks.forEach(r => r.espacios.forEach(e => {
      if (e.id === Number(formData.espacioId)) {
        label = `${z.nombre} - Rack ${r.codigo} - Espacio ${e.numero}`;
      }
    })));
    return label;
  }, [formData.espacioId, zonas]);

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
        estado: embarcacion.estado || 'EN_CUNA',
        descuento: embarcacion.descuento !== undefined ? String(embarcacion.descuento) : '0'
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
      descuento: parseFloat(formData.descuento) || 0,
      clienteId: formData.clienteId ? parseInt(formData.clienteId) : null,
      espacioId: formData.espacioId ? parseInt(formData.espacioId) : null
    };

    try {
      if (isEditing) {
        await updateEmbarcacion.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createEmbarcacion.mutateAsync(payload);
      }
      toast.success(isEditing ? 'Embarcación actualizada' : 'Embarcación registrada');
      // Esperar que react-query termine de invalidar antes de navegar
      await queryClient.invalidateQueries({ queryKey: ['embarcaciones'], refetchType: 'all' });
      navigate('/embarcaciones');
    } catch (error: any) {
      console.error('Error saving embarcacion:', error);
    }
  };

  if (isEditing && isFetchingEmb) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)]">Cargando datos de la embarcación...</p>
      </div>
    );
  }

  const isPending = createEmbarcacion.isPending || updateEmbarcacion.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">
      <div className="flex items-center gap-6">
        <Link to="/embarcaciones" className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 shadow-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {isEditing ? 'Editar Embarcación' : 'Registrar Embarcación'}
          </h2>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Completa los datos técnicos y de titularidad de la unidad.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)]/40 backdrop-blur-xl rounded-3xl border border-[var(--border-primary)]/60 shadow-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -z-10" />

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombre de la Embarcación *</label>
              <input
                type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-bold"
                placeholder="Ej: La Bestia"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Matrícula (REY) *</label>
              <input
                type="text" name="matricula" value={formData.matricula} onChange={handleChange} required
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-mono"
                placeholder="REY-1234"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo *</label>
              <select
                name="tipo" value={formData.tipo} onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] transition-all font-medium appearance-none"
              >
                <option value="Lancha">Lancha</option>
                <option value="Crucero">Crucero</option>
                <option value="Velero">Velero</option>
                <option value="Moto de Agua">Moto de Agua</option>
                <option value="Bote">Bote Recreativo</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Propietario *</label>
              <select
                name="clienteId" value={formData.clienteId} onChange={handleChange} required
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] transition-all font-bold appearance-none"
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
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Eslora (Metros)</label>
              <input
                type="number" step="0.01" name="eslora" value={formData.eslora} onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] transition-all font-mono"
                placeholder="Ej: 5.50"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Manga (Metros)</label>
              <input
                type="number" step="0.01" name="manga" value={formData.manga} onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] transition-all font-mono"
                placeholder="Ej: 2.10"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Descuento Especial (%)</label>
              <input
                type="number" step="0.01" min="0" max="100" name="descuento" value={formData.descuento} onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] transition-all font-mono"
                placeholder="Ej: 15.00"
              />
            </div>

            <div className="space-y-3 col-span-full">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Ubicación Asignada (Rack / Espacio)</label>

              <div className="flex items-center gap-4">
                <div className="flex-1 px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl flex items-center justify-between">
                  {selectedEspacioLabel ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{selectedEspacioLabel}</span>
                    </div>
                  ) : (
                    <span className="text-[var(--text-secondary)] italic font-medium">Sin ubicación asignada (A flote o transitoria)</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isFetchingZonas}
                  className="px-6 py-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold rounded-2xl transition-colors shrink-0 disabled:opacity-50"
                >
                  {isFetchingZonas ? 'Cargando...' : selectedEspacioLabel ? 'Cambiar Ubicación' : 'Asignar Ubicación'}
                </button>
              </div>

              <UbicacionPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                zonas={zonas}
                onSelect={(espacioId) => {
                  setFormData(prev => ({
                    ...prev,
                    espacioId: espacioId ? String(espacioId) : '',
                    // Si se quita la ubicación, cambiar estado a EN_AGUA automáticamente
                    estado: espacioId ? prev.estado : 'EN_AGUA'
                  }));
                }}
                currentEspacioId={formData.espacioId ? Number(formData.espacioId) : undefined}
                boatDimensions={{
                  eslora: parseFloat(formData.eslora) || 0,
                  manga: parseFloat(formData.manga) || 0
                }}
              />
            </div>

            <div className="space-y-3 col-span-full">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado Operativo Actual</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {['EN_CUNA', 'EN_AGUA', 'MANTENIMIENTO', 'INACTIVA'].map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => setFormData({ ...formData, estado })}
                    className={`px-4 py-3 rounded-xl border font-bold text-xs transition-all ${formData.estado === estado
                      ? 'bg-blue-600 border-blue-500 text-[var(--text-primary)] shadow-lg shadow-blue-600/20'
                      : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-blue-500/40'
                      }`}
                  >
                    {estado.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-8 flex items-center justify-end gap-4 border-t border-[var(--border-primary)]/60">
            <Link
              to="/embarcaciones"
              className="px-8 py-4 text-[var(--text-secondary)] font-bold bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all active:scale-95 shadow-lg"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-3 px-10 py-4 text-[var(--text-primary)] font-bold bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20"
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
