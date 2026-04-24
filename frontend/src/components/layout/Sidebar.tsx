import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Ship,
  Navigation,
  CircleDollarSign,
  LayoutGrid,
  Wrench,
  FileText,
  X,
  ShieldCheck,
  Settings,
  HelpCircle,
  Anchor,
  BarChart2,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navGroups = [
  {
    title: 'Operativo',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
      { name: 'Operaciones', path: '/operaciones', icon: Navigation, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
      { name: 'Clientes', path: '/clientes', icon: Users, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
      { name: 'Embarcaciones', path: '/embarcaciones', icon: Ship, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { name: 'Servicios', path: '/servicios', icon: Wrench, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR] },
      { name: 'Finanzas', path: '/finanzas', icon: CircleDollarSign, roles: [Role.SUPERADMIN, Role.ADMIN] },
      { name: 'Facturación', path: '/facturacion', icon: FileText, roles: [Role.SUPERADMIN, Role.ADMIN] },
      { name: 'Reportes', path: '/reportes', icon: BarChart2, roles: [Role.SUPERADMIN, Role.ADMIN] },
      { name: 'Infraestructura', path: '/infraestructura', icon: LayoutGrid, roles: [Role.SUPERADMIN, Role.ADMIN] },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { name: 'Usuarios', path: '/usuarios', icon: ShieldCheck, roles: [Role.SUPERADMIN, Role.ADMIN] },
      { name: 'Sedes', path: '/sedes', icon: Building2, roles: [Role.SUPERADMIN] },
      { name: 'Configuración', path: '/configuracion', icon: Settings, roles: [Role.SUPERADMIN, Role.ADMIN] },
      { name: 'Ayuda', path: '/ayuda', icon: HelpCircle, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR] },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => user && item.roles.includes(user.role))
    }))
    .filter(group => group.items.length > 0);

  const handleCloseMobile = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        md:relative md:translate-x-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        width: 248,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="flex items-center gap-3 px-4"
        style={{
          height: 64,
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Anchor size={18} color="white" />
        </div>

        <div className="min-w-0">
          <div
            className="font-extrabold leading-none tracking-tight"
            style={{
              color: 'var(--text-primary)',
              fontSize: 16,
            }}
          >
            Gestor<span style={{ color: 'var(--accent-primary)' }}>Náutico</span>
          </div>
          <div
            className="mt-1"
            style={{
              fontSize: 11,
              lineHeight: 1,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Panel operativo
          </div>
        </div>

        <button
          onClick={onClose}
          className="icon-button ml-auto md:hidden"
          aria-label="Cerrar menú"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-6">
        {filteredGroups.map(group => (
          <div key={group.title} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map(({ name, path, icon: Icon }) => {
                const active = isActive(path);

                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={handleCloseMobile}
                    className={`nav-item ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={19} className="shrink-0" />
                    <span className="nav-item-label">{name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div
          className="p-3"
          style={{
            borderTop: '1px solid var(--border-primary)',
          }}
        >
          <div
            className="bento-card"
            style={{
              padding: 14,
              background: 'var(--bg-card)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  background: 'var(--accent-primary-soft)',
                  color: 'var(--accent-primary)',
                  border: '1px solid color-mix(in srgb, var(--accent-primary) 18%, transparent)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {user.nombre?.slice(0, 2)?.toUpperCase() || 'US'}
              </div>

              <div className="min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {user.nombre}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    lineHeight: 1.3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 4,
                  }}
                >
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}