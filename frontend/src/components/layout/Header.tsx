import { useAuth } from '../../features/auth/context/AuthContext';
import { Menu, LogOut, Search, Bell, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { NotificationPopover } from '../../features/notificaciones/components/NotificationPopover';
import { useNotificaciones } from '../../features/notificaciones/hooks/useNotificaciones';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotificaciones();

  return (
    <header className="h-20 bg-slate-950/20 backdrop-blur-md border-b border-slate-800/40 flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative group hidden lg:block max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
          />
        </div>
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`text-slate-400 hover:text-white relative p-2 rounded-lg transition-all ${isNotificationsOpen ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
            )}
          </button>
          
          <NotificationPopover 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        <div className="h-8 w-px bg-slate-800/60 mx-1"></div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
              <UserIcon size={20} className="text-slate-400" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-tight">{user.role}</p>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{user.nombre}</p>
            </div>
            
            <button 
              onClick={logout}
              className="group flex items-center justify-center p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300 shadow-lg shadow-red-500/5 hover:shadow-red-500/20"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 group-hover:scale-90 transition-transform" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-slate-500 font-medium">No autenticado</span>
        )}
      </div>
    </header>
  );
}

