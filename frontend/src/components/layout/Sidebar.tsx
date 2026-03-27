import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Ship, Navigation, CircleDollarSign } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-indigo-900 border-r border-indigo-800 text-white flex-shrink-0 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-indigo-800 font-bold text-xl tracking-wider">
        Gestor Náutico
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-2">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${isActive('/') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/60'}`}>
            <LayoutDashboard className="w-5 h-5" />Dashboard
          </Link>
          <Link to="/clientes" className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${isActive('/clientes') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/60'}`}>
            <Users className="w-5 h-5" />Clientes
          </Link>
          <Link to="/embarcaciones" className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${isActive('/embarcaciones') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/60'}`}>
            <Ship className="w-5 h-5" />Embarcaciones
          </Link>
          <Link to="/operaciones" className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${isActive('/operaciones') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/60'}`}>
            <Navigation className="w-5 h-5" />Operaciones
          </Link>
          <Link to="/finanzas" className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${isActive('/finanzas') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/60'}`}>
            <CircleDollarSign className="w-5 h-5" />Finanzas
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-indigo-800">
        <div className="text-sm font-medium text-indigo-200">User Setup</div>
      </div>
    </aside>
  );
}
