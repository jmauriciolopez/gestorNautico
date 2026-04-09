import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';

export default function ClienteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { useCliente, createCliente, updateCliente } = useClientes();

  const { data: cliente, isLoading: isFetching } = useCliente(Number(id));

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    activo: true,
    diaFacturacion: 1,
    descuento: 0,
    tipoCuota: 'NINGUNA',
  });

  // Sync data when editing
  useEffect(() => {
    if (isEditing && cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        dni: cliente.dni || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        activo: cliente.activo ?? true,
        diaFacturacion: cliente.diaFacturacion ?? 1,
        descuento: cliente.descuento ?? 0,
        tipoCuota: cliente.tipoCuota || 'NINGUNA',
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
        <p className="mt-4 text-[var(--text-secondary)]">Cargando datos del cliente...</p>
      </div>
    );
  }

  const isPending = createCliente.isPending || updateCliente.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6">
        <Link to="/clientes" className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 shadow-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">
            {isEditing ? 'Actualiza la información del perfil del cliente.' : 'Registra un nuevo cliente en el sistema náutico.'}
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)]/40 backdrop-blur-xl rounded-3xl border border-[var(--border-primary)]/60 shadow-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -z-10" />

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-3">
              <label htmlFor="nombre" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-medium"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="dni" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">DNI / Documento *</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-mono"
                placeholder="Ej: 12345678"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="email" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-medium"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="telefono" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-medium"
                placeholder="+54 11 1234-5678"
              />
            </div>

            {/* Facturación Fields */}
            <div className="space-y-3">
              <label htmlFor="diaFacturacion" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Día de Facturación</label>
              <input
                type="number"
                id="diaFacturacion"
                name="diaFacturacion"
                min="1"
                max="31"
                value={formData.diaFacturacion}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-medium"
                placeholder="Ej: 1"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="descuento" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Descuento (%)</label>
              <input
                type="number"
                id="descuento"
                name="descuento"
                min="0"
                max="100"
                step="0.01"
                value={formData.descuento}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 transition-all font-medium"
                placeholder="Ej: 10.5"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tarifa Base Referencial ($)</label>
              <div className="w-full px-5 py-4 bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] font-mono flex items-center justify-between cursor-not-allowed">
                <span>{cliente?.tarifaBase || '0.00'}</span>
                <span className="text-[10px] font-black uppercase text-amber-500/50">Solo Informativo</span>
              </div>
              <p className="text-[9px] text-[var(--text-secondary)] italic ml-1">Esta tarifa es referencial. La facturación real se calcula según el Rack asignado.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo de Cuota</label>
              <select
                id="tipoCuota"
                name="tipoCuota"
                value={formData.tipoCuota}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-[var(--text-primary)] transition-all font-medium appearance-none"
              >
                <option value="NINGUNA">Ninguna (Solo Amarre)</option>
                <option value="INDIVIDUAL">Socio Individual</option>
                <option value="FAMILIAR">Grupo Familiar</option>
              </select>
            </div>

            {/* TODO: Implementar lógica de selección de Responsable de Familia */}
          </div>

          <div className="pt-8 border-t border-[var(--border-primary)]/60">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="mt-1 relative">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-6 h-6 rounded-lg bg-[var(--bg-primary)] border-[var(--border-primary)] text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-all cursor-pointer"
                />
              </div>
              <div>
                <span className="text-base font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">Estado del Cliente</span>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Los clientes inactivos no aparecerán en las selecciones rápidas ni facturación automática.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-8 flex items-center justify-end gap-4 border-t border-[var(--border-primary)]/60">
            <Link
              to="/clientes"
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
              {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
