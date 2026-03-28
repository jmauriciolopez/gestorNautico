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
      fixed inset-y-0 left-0 z-50 w-72 bg-[var(--bg-secondary)]/[0.95] backdrop-blur-2xl border-r border-[var(--border-primary)] text-[var(--text-secondary)] flex flex-col transition-all duration-300 ease-in-out
      md:relative md:translate-x-0 md:bg-[var(--bg-secondary)]/[0.4]
      ${isOpen ? 'translate-x-0 outline-none' : '-translate-x-full'}
    `}>
      <div className="h-20 flex items-center px-8 gap-4 border-b border-[var(--border-primary)] group select-none relative transition-colors duration-300">
        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-500/20 group-hover:rotate-[15deg] transition-transform duration-500">
          <Compass className="w-6 h-6 text-[var(--text-primary)]" />
        </div>
        <span className="font-black text-xl tracking-tighter text-[var(--text-primary)] uppercase italic flex-1 flex flex-col leading-none">
          Gestor <span className="text-indigo-600">Náutico</span>
        </span>

        <button
          onClick={onClose}
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 py-8 space-y-1.5 custom-scrollbar">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => { if (window.innerWidth < 768) onClose(); }}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
              ${isActive(item.path)
                ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40'
                : 'hover:bg-indigo-600/10 hover:text-[var(--text-primary)]'}
            `}
          >
            <span className={`${isActive(item.path) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-indigo-400'} transition-colors duration-300`}>
              {item.icon}
            </span>
            <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isActive(item.path) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-8">
        <div className="bg-[var(--bg-secondary)]/[0.3] p-6 rounded-[2rem] border border-[var(--border-primary)] shadow-xl relative overflow-hidden group/quote">
          <div className="absolute -right-2 -bottom-2 opacity-5 text-indigo-500 scale-150 group-hover/quote:scale-110 transition-transform duration-1000">
            <Compass className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <UserIcon size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] truncate leading-none mb-1">{user?.role || 'Guest'}</p>
              <p className="text-xs text-[var(--text-primary)] font-black uppercase tracking-tighter truncate">{user?.nombre || 'Visitante'}</p>
            </div>
          </div>
          <p className="text-[9px] font-bold leading-relaxed text-[var(--text-muted)] italic uppercase tracking-tighter relative z-10">
            "Navegar no es una opción, es un estilo de vida."
          </p>
        </div>
      </div>
    </aside>
  );
}
