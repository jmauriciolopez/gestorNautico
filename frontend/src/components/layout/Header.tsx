import { useAuth } from '../../features/auth/context/AuthContext';
import {
  Menu,
  LogOut,
  Search,
  Bell,
  User as UserIcon,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { NotificationPopover } from '../../features/notificaciones/components/NotificationPopover';
import { useNotificaciones } from '../../features/notificaciones/hooks/useNotificaciones';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { GlobalSearchDropdown } from '../search/GlobalSearchDropdown';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotificaciones();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, hasResults, isActive } = useGlobalSearch(query);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: 64,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-2 flex-1">
        {/* Mobile menu */}
        <button onClick={onMenuClick} className="icon-button md:hidden">
          <Menu size={18} />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative hidden lg:block w-[320px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
            placeholder="Buscar clientes, barcos, racks..."
            className="input-ui input-search text-ui-sm"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}

          {isSearchOpen && (
            <GlobalSearchDropdown
              results={results}
              isLoading={isLoading}
              hasResults={hasResults}
              isActive={isActive}
              onSelect={() => {
                setQuery('');
                setIsSearchOpen(false);
              }}
            />
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="icon-button"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`icon-button ${isNotificationsOpen ? 'active' : ''}`}
          >
            <Bell size={16} />

            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--accent-primary)' }}
              />
            )}
          </button>

          <NotificationPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Divider */}
        <div className="divider-vertical mx-1" />

        {/* User */}
        {user && (
          <div className="flex items-center gap-3 pl-1">
            {/* Avatar */}
            <div
              className="flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)',
              }}
            >
              <UserIcon size={16} />
            </div>

            {/* Info */}
            <div className="hidden sm:block">
              <div
                className="text-ui-sm font-semibold leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {user.nombre}
              </div>
              <div
                className="mt-1"
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {user.role}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="icon-button"
              title="Cerrar sesión"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--accent-red)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--text-muted)')
              }
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}