import { useState, useEffect } from 'react';
import { X, Package, Tag, DollarSign, Type, Loader2 } from 'lucide-react';
import { ServicioCatalogo } from '../hooks/useServicios';

interface NuevoServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ServicioCatalogo>) => Promise<void>;
  initialData?: ServicioCatalogo | null;
}

export function NuevoServicioModal({ isOpen, onClose, onSave, initialData }: NuevoServicioModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioBase: 0,
    categoria: 'GENERAL',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || '',
        precioBase: Number(initialData.precioBase),
        categoria: initialData.categoria || 'GENERAL',
        activo: initialData.activo,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precioBase: 0,
        categoria: 'GENERAL',
        activo: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/60 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-500" />
              {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">Configura los detalles del servicio en el catálogo.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre del Servicio</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Lavado de Casco"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Precio Base</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                  value={formData.precioBase}
                  onChange={e => setFormData({ ...formData, precioBase: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="GENERAL">General</option>
                  <option value="LAVADO">Lavado</option>
                  <option value="MECANICA">Mecánica</option>
                  <option value="BOTADURA">Movimiento</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all min-h-[100px] resize-none"
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalles adicionales sobre el servicio..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
            <input
              type="checkbox"
              id="activo"
              className="w-5 h-5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
              checked={formData.activo}
              onChange={e => setFormData({ ...formData, activo: e.target.checked })}
            />
            <label htmlFor="activo" className="text-sm font-bold text-slate-300 cursor-pointer select-none">
              Servicio Activo (Disponible para registros)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Guardar Cambios' : 'Crear Servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
