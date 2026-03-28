import { useState, useEffect } from 'react';
import { X, Package, Tag, DollarSign, Type, Loader2, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)]/60 w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                {initialData ? 'Editar Definición' : 'Nuevo Servicio'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">Gestión de Catálogo Maestro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3 h-3 text-indigo-400" /> Identificador / Nombre
            </label>
            <input
              type="text"
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 focus:outline-none focus:border-indigo-500 transition-all font-bold uppercase text-sm"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: LAVADO INTEGRAL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Precio Base
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-black tabular-nums text-sm"
                value={formData.precioBase}
                onChange={e => setFormData({ ...formData, precioBase: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Type className="w-3 h-3 text-indigo-400" /> Categoría
              </label>
              <select
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer uppercase text-xs"
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Descripción Técnica</label>
            <textarea
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-5 py-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 focus:outline-none focus:border-indigo-500 transition-all min-h-[100px] resize-none"
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Especificaciones del servicio..."
            />
          </div>

          <div
            onClick={() => setFormData({ ...formData, activo: !formData.activo })}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${formData.activo ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[var(--bg-primary)] border-[var(--border-primary)] opacity-60'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${formData.activo ? 'bg-emerald-500 text-[var(--text-primary)]' : 'bg-slate-800 text-transparent'
                }`}>
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${formData.activo ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
                Servicio Activo
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Disponible para registros</span>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all underline-offset-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[var(--text-primary)] font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/40 active:scale-95 flex items-center justify-center gap-3 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[var(--text-primary)]" /> : (initialData ? 'Guardar Cambios' : 'Certificar Servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
