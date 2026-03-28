import { useState } from 'react';
import { Ship, X, AlertTriangle } from 'lucide-react';
import { Embarcacion } from '../../embarcaciones/hooks/useEmbarcaciones';

interface LiberarEspacioModalProps {
  isOpen: boolean;
  onClose: () => void;
  espacioId: number;
  codigoEspacio: string;
  embarcacionEnElLugar?: Embarcacion;
  onLiberar: (embarcacionId: number | null, nuevoEstado: string) => Promise<void>;
}

export function LiberarEspacioModal({
  isOpen,
  onClose,
  codigoEspacio,
  embarcacionEnElLugar,
  onLiberar
}: LiberarEspacioModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState<string>('EN_AGUA');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onLiberar(embarcacionEnElLugar ? embarcacionEnElLugar.id : null, nuevoEstado);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-500/20 bg-blue-500/5">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <Ship className="w-5 h-5 text-blue-400" />
              Gestionar Ocupación: {codigoEspacio}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Actualizar el estado operativo o desasignar la ubicación actual.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {embarcacionEnElLugar ? (
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 font-mono text-xs">ID_{embarcacionEnElLugar.id}</div>
              <div>
                <p className="text-xl font-black text-white">{embarcacionEnElLugar.nombre}</p>
                <p className="text-slate-500 font-medium text-sm">Propietario: {embarcacionEnElLugar.cliente?.nombre || 'Desconocido'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-amber-400">
              <AlertTriangle className="shrink-0 w-5 h-5" />
              <p className="text-sm font-medium">Atención: Este espacio figura ocupado, pero no se encontró la embarcación en los registros asignada a este ID. Si confirma la liberación, simplemente se forzará el estado del espacio a Libre.</p>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nuevo Estado Operativo de la Embarcación</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'EN_CUNA', label: '📦 En Cuna (Regresa)' },
                { value: 'EN_AGUA', label: '⚓ Puesta a flote (Agua)' },
                { value: 'MANTENIMIENTO', label: '🔧 Varadero (Manten.)' },
                { value: 'INACTIVA', label: '🔴 Fuera del Complejo' }
              ]
                .filter(estado => estado.value !== embarcacionEnElLugar?.estado)
                .map((estado) => (
                <button
                  key={estado.value}
                  type="button"
                  onClick={() => setNuevoEstado(estado.value)}
                  className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all text-left ${
                    nuevoEstado === estado.value 
                      ? estado.value === 'INACTIVA' 
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/5'
                        : 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/5' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {estado.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-slate-800/60 bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 text-slate-400 hover:text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading || !nuevoEstado} 
            className={`px-6 py-3 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
              nuevoEstado === 'INACTIVA' 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
            }`}
          >
            {isLoading 
              ? 'Procesando...' 
              : nuevoEstado === 'INACTIVA' 
                ? 'Liberar Espacio' 
                : 'Guardar Estado'}
          </button>
        </div>
      </div>
    </div>
  );
}
