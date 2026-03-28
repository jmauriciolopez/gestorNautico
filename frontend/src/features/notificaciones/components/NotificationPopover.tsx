import { Bell, Check, Trash2, Clock, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNotificaciones, Notificacion } from '../hooks/useNotificaciones';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const { getNotificaciones, markAsRead, markAllAsRead, deleteNotificacion, unreadCount } = useNotificaciones();

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: number) => {
    await markAsRead.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  const handleDelete = async (id: number) => {
    await deleteNotificacion.mutateAsync(id);
  };

  const notifications = getNotificaciones.data || [];

  const getIcon = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'ALERTA': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'EXITO': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'SISTEMA': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-20 right-8 w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Notificaciones</h4>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadCount} NUEVAS
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-tighter flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" />
              Marcar todo como leído
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-800/40">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-5 hover:bg-slate-800/30 transition-all flex gap-4 group relative ${!n.leida ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className={`mt-1 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    n.tipo === 'ALERTA' ? 'bg-rose-500/10' : 
                    n.tipo === 'EXITO' ? 'bg-emerald-500/10' : 
                    'bg-indigo-500/10'
                  }`}>
                    {getIcon(n.tipo)}
                  </div>
                  
                  <div className="flex-1 space-y-1 pr-6">
                    <p className={`text-sm font-bold leading-tight ${!n.leida ? 'text-white' : 'text-slate-300'}`}>
                      {n.titulo}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {n.mensaje}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute right-4 top-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.leida && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-1.5 bg-slate-950 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg border border-slate-800 transition-all"
                        title="Marcar como leído"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 bg-slate-950 text-slate-500 hover:bg-rose-500 hover:text-white rounded-lg border border-slate-800 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-slate-700/50">
                <Bell className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin notificaciones</p>
                <p className="text-xs text-slate-600 font-bold mt-1">Estás al día con todas tus tareas.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/60 bg-slate-900/80 text-center">
          <button 
            onClick={onClose}
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Cerrar Menú
          </button>
        </div>
      </div>
    </>
  );
}
