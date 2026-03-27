import { useAuth } from '../../features/auth/context/AuthContext';
import { Menu, LogOut, UserCircle } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Gestión Integral</h1>
        <button className="md:hidden text-gray-600 hover:text-indigo-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <UserCircle className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{user.nombre || 'Usuario'}</span>
            <button 
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No autenticado</span>
        )}
      </div>
    </header>
  );
}
