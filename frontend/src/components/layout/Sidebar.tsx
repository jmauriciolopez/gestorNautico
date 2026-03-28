import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Ship, 
  Navigation, 
  CircleDollarSign,
  Compass,
  User as UserIcon,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Role } from '../../types';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN]
    },
    { 
      name: 'Clientes', 
      path: '/clientes', 
      icon: <Users className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR]
    },
    { 
      name: 'Embarcaciones', 
      path: '/embarcaciones', 
      icon: <Ship className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR]
    },
    { 
      name: 'Operaciones', 
      path: '/operaciones', 
      icon: <Navigation className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR]
    },
    { 
      name: 'Infraestructura', 
      path: '/infraestructura', 
      icon: <LayoutGrid className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR]
    },
    { 
      name: 'Finanzas', 
      path: '/finanzas', 
      icon: <CircleDollarSign className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN]
    },
  ];

  // Filtrar items según rol
  const filteredItems = navItems.filter(item => 
    !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <aside className="w-72 bg-slate-900/60 backdrop-blur-2xl border-r border-slate-800/50 text-slate-300 flex-shrink-0 flex flex-col hidden md:flex transition-all duration-300">
      <div className="h-20 flex items-center px-8 gap-3 border-b border-slate-800/50 group select-none cursor-default">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <span className="font-extrabold text-xl tracking-tighter text-white uppercase italic">
          Gestor <span className="text-blue-500">Náutico</span>
        </span>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1 custom-scrollbar">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:bg-slate-800/50 hover:text-white'}
            `}
          >
            <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors duration-200`}>
              {item.icon}
            </span>
            <span className="font-semibold text-sm tracking-wide text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <UserIcon size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{user?.role || 'Guest'}</p>
              <p className="text-[11px] text-slate-400 font-medium truncate">{user?.nombre || 'Visitante'}</p>
            </div>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500 italic">
            "Navegar no es una opción, es un estilo de vida."
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
