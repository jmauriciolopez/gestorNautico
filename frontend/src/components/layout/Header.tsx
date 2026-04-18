import { useAuth } from '../../features/auth/context/AuthContext';
import { Menu, LogOut, Search, Bell, User as UserIcon, Sun, Moon, X } from 'lucide-react';
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotificaciones();

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

  const iconBtn = "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer";

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: 56,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={onMenuClick}
          className={`${iconBtn} md:hidden`}
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu size={18} />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative hidden lg:block" style={{ width: 280 }}>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsSearchOpen(true); }}
            onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
            placeholder="Buscar clientes, barcos, racks..."
            className="w-full text-xs py-2 pl-8 pr-8 rounded-xl outline-none transition-all"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setIsSearchOpen(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={12} />
            </button>
          )}
          {isSearchOpen && (
            <GlobalSearchDropdown
              results={results}
              isLoading={isLoading}
              hasResults={hasResults}
              isActive={isActive}
              onSelect={() => { setQuery(''); setIsSearchOpen(false); }}
            />
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={iconBtn}
          style={{ color: 'var(--text-secondary)' }}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={iconBtn}
            style={{ color: isNotificationsOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
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
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-primary)' }} />

        {/* User */}
        {user && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}
            >
              <UserIcon size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                {user.nombre}
              </p>
              <p className="text-[9px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {user.role}
              </p>
            </div>
            <button
              onClick={logout}
              className={`${iconBtn} ml-1`}
              style={{ color: 'var(--text-muted)' }}
              title="Cerrar sesión"
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
