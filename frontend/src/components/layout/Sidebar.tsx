import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Ship, 
  Navigation, 
  CircleDollarSign,
  Compass,
  User as UserIcon,
  LayoutGrid,
  Wrench,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      name: 'Servicios', 
      path: '/servicios', 
      icon: <Wrench className="w-5 h-5" />,
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
    { 
      name: 'Facturación', 
      path: '/facturacion', 
      icon: <FileText className="w-5 h-5" />,
      allowedRoles: [Role.SUPERADMIN, Role.ADMIN]
    },
  ];

  // Filtrar items según rol
  const filteredItems = navItems.filter(item => 
    !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/50 text-slate-300 flex flex-col transition-all duration-300 ease-in-out
      md:relative md:translate-x-0 md:bg-slate-900/60
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-20 flex items-center px-8 gap-3 border-b border-slate-800/50 group select-none relative">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <span className="font-extrabold text-xl tracking-tighter text-white uppercase italic flex-1">
          Gestor <span className="text-blue-500">Náutico</span>
        </span>
        
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1 custom-scrollbar">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => { if (window.innerWidth < 768) onClose(); }}
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
}

