import { useState, useEffect } from 'react';
import { Save, Loader2, Clock, CircleDollarSign, Info, AlertTriangle } from 'lucide-react';
import { useConfiguracion } from '../hooks/useConfiguracion';

export default function ConfiguracionPage() {
  const { getConfiguraciones, updateConfiguracion } = useConfiguracion();
  const { data: configs, isLoading } = getConfiguraciones;
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (configs) {
      const initialData: Record<string, string> = {};
      configs.forEach(c => {
        initialData[c.clave] = c.valor;
      });
      setFormData(initialData);
    }
  }, [configs]);

  const handleChange = (clave: string, valor: string) => {
    setFormData(prev => ({ ...prev, [clave]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    try {
      await updateConfiguracion.mutateAsync(formData);
      setMessage({ type: 'success', text: 'Configuraciones actualizadas con éxito' });
      setTimeout(() => setMessage(null), 3000);
    } catch  {
      setMessage({ type: 'error', text: 'Error al actualizar configuraciones' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase italic">
          Configuración <span className="text-indigo-500">del Sistema</span>
        </h1>
        <p className="text-[var(--text-secondary)]">Administra parámetros globales, precios de cuotas y horarios operativos.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <Info className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección Cuotas */}
        <div className="bg-[var(--bg-secondary)]/[0.4] border border-[var(--border-primary)] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <CircleDollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-[var(--text-primary)]">Tarifas y Cuotas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Cuota Individual ($)</label>
              <input
                type="number"
                value={formData['CUOTA_INDIVIDUAL'] || ''}
                onChange={(e) => handleChange('CUOTA_INDIVIDUAL', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Cuota Familiar ($)</label>
              <input
                type="number"
                value={formData['CUOTA_FAMILIAR'] || ''}
                onChange={(e) => handleChange('CUOTA_FAMILIAR', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Días hasta vencimiento de cargos</label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData['DIAS_VENCIMIENTO'] || ''}
                onChange={(e) => handleChange('DIAS_VENCIMIENTO', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
              />
              <p className="text-[10px] text-[var(--text-secondary)] italic">Días desde la emisión hasta el vencimiento. Se aplica a cargos automáticos y manuales.</p>
            </div>
          </div>
        </div>

        {/* Sección Mora */}
        <div className="bg-[var(--bg-secondary)]/[0.4] border border-[var(--border-primary)] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-[var(--text-primary)]">Mora e Intereses</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Tasa Interés Mensual (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData['MORA_TASA_INTERES'] || ''}
                onChange={(e) => handleChange('MORA_TASA_INTERES', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-red-500/50 outline-none transition-all font-bold"
              />
              <p className="text-[10px] text-[var(--text-secondary)] italic">Porcentaje de interés mensual por atraso.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Tasa Recargo (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData['MORA_TASA_RECARGO'] || ''}
                onChange={(e) => handleChange('MORA_TASA_RECARGO', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-red-500/50 outline-none transition-all font-bold"
              />
              <p className="text-[10px] text-[var(--text-secondary)] italic">Recargo fijo por pago fuera de término.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Días de Gracia</label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData['MORA_DIAS_GRACIA'] || ''}
                onChange={(e) => handleChange('MORA_DIAS_GRACIA', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-red-500/50 outline-none transition-all font-bold"
              />
              <p className="text-[10px] text-[var(--text-secondary)] italic">Días sin interés ni recargo después del vencimiento.</p>
            </div>
          </div>
        </div>

        {/* Sección Horarios */}
        <div className="bg-[var(--bg-secondary)]/[0.4] border border-[var(--border-primary)] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-[var(--text-primary)]">Horarios Operativos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-emerald-400">Hora de Apertura</label>
              <input
                type="time"
                value={formData['HORARIO_APERTURA'] || ''}
                onChange={(e) => handleChange('HORARIO_APERTURA', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-red-400">Límite Máximo Subida</label>
              <input
                type="time"
                value={formData['HORARIO_MAX_SUBIDA'] || ''}
                onChange={(e) => handleChange('HORARIO_MAX_SUBIDA', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 outline-none transition-all font-bold"
              />
              <p className="text-[10px] text-[var(--text-secondary)] italic">Los movimientos registrados después de esta hora se marcarán automáticamente en los reportes.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
