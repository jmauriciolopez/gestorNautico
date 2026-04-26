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
      <div className="bg-[var(--modal-glass-bg)] backdrop-blur-md border border-[var(--border-strong)] w-full max-w-lg rounded-[3rem] shadow-2xl shadow-indigo-900/10 overflow-y-auto max-h-[calc(100vh-2rem)] transform animate-in slide-in-from-bottom-8 duration-500 custom-scrollbar">

        {/* Header */}
        <div className="px-10 pt-10 pb-6 border-b border-[var(--border-primary)] flex justify-between items-start bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                {initialData ? 'Editar Definición' : 'Nuevo Servicio'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.25em] mt-1 opacity-70">Gestión de Catálogo Maestro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-[var(--text-secondary)] hover:text-white transition-all border border-transparent hover:border-white/10 active:scale-90">
            <X className="w-6 h-6" />
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
                <DollarSign className="w-3 h-3 text-indigo-500" /> Precio Base
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
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${formData.activo ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-[var(--bg-primary)] border-[var(--border-primary)] opacity-60'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${formData.activo ? 'bg-indigo-600 text-[var(--text-primary)]' : 'bg-slate-800 text-transparent'
                }`}>
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${formData.activo ? 'text-indigo-400' : 'text-[var(--text-secondary)]'}`}>
                Servicio Activo
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Disponible para registros</span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black rounded-2xl text-xs uppercase tracking-[0.25em] shadow-xl shadow-indigo-900/40 active:scale-95 flex items-center justify-center gap-3 transition-all group/btn"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{initialData ? 'Guardar Cambios' : 'Crear Servicio'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
