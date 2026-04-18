import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Ship, Navigation,
  CircleDollarSign, LayoutGrid, Wrench, FileText,
  X, ShieldCheck, Settings, HelpCircle, Anchor
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  // Todos los roles autenticados
  { name: 'Dashboard',       path: '/',                icon: LayoutDashboard, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
  { name: 'Clientes',        path: '/clientes',        icon: Users,           roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
  { name: 'Embarcaciones',   path: '/embarcaciones',   icon: Ship,            roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
  { name: 'Operaciones',     path: '/operaciones',     icon: Navigation,      roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
  { name: 'Servicios',       path: '/servicios',       icon: Wrench,          roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
  { name: 'Infraestructura', path: '/infraestructura', icon: LayoutGrid,      roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
  // Supervisor en adelante
  { name: 'Finanzas',        path: '/finanzas',        icon: CircleDollarSign, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR] },
  { name: 'Facturación',     path: '/facturacion',     icon: FileText,         roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR] },
  // Solo Admin y SuperAdmin
  { name: 'Configuración',   path: '/configuracion',   icon: Settings,         roles: [Role.SUPERADMIN, Role.ADMIN] },
  // Solo SuperAdmin
  { name: 'Usuarios',        path: '/usuarios',        icon: ShieldCheck,      roles: [Role.SUPERADMIN] },
  // Todos
  { name: 'Ayuda',           path: '/ayuda',           icon: HelpCircle,       roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const filtered = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        md:relative md:translate-x-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        width: 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid var(--border-primary)', height: 56 }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-primary)' }}
        >
          <Anchor size={16} color="white" />
        </div>
        <span className="font-black text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Gestor<span style={{ color: 'var(--accent-primary)' }}>Náutico</span>
        </span>
        <button
          onClick={onClose}
          className="ml-auto md:hidden p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 space-y-0.5">
        {filtered.map(({ name, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={() => { if (window.innerWidth < 768) onClose(); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
              style={{
                background: active ? 'var(--accent-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--border-primary)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={16} className="shrink-0" />
              <span className="text-xs font-semibold tracking-wide">{name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
