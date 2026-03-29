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

  // Global Search
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { results, isLoading, hasResults, isActive } = useGlobalSearch(query);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsSearchOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsSearchOpen(false);
  };

  const handleSelect = () => {
    setQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="h-20 bg-[var(--bg-primary)]/[0.05] backdrop-blur-md border-b border-[var(--border-primary)] flex items-center justify-between px-8 z-10 transition-colors duration-300">
      <div className="flex items-center gap-6 flex-1">
        {/* Global Search Box */}
        <div ref={searchRef} className="relative group hidden lg:block max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
            placeholder="Búsqueda global... (clientes, barcos, racks)"
            className="w-full bg-[var(--bg-secondary)]/[0.3] border border-[var(--border-primary)] rounded-xl py-2 pl-10 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium placeholder:text-[var(--text-secondary)]/50"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dropdown */}
          {isSearchOpen && (
            <GlobalSearchDropdown
              results={results}
              isLoading={isLoading}
              hasResults={hasResults}
              isActive={isActive}
              onSelect={handleSelect}
            />
          )}
        </div>

        <button
          onClick={onMenuClick}
          className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 hover:bg-[var(--bg-secondary)]/[0.2] rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-[var(--bg-secondary)]/[0.5] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-indigo-400 rounded-xl transition-all active:scale-90 flex items-center justify-center group"
          title={theme === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`text-[var(--text-secondary)] hover:text-indigo-400 relative p-2.5 bg-[var(--bg-secondary)]/[0.5] border border-[var(--border-primary)] rounded-xl transition-all active:scale-95 ${isNotificationsOpen ? 'bg-indigo-600/10 text-indigo-400' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse"></span>
            )}
          </button>

          <NotificationPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        <div className="h-8 w-px bg-[var(--border-primary)] mx-1 hidden sm:block"></div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[var(--bg-secondary)]/[0.1] border border-[var(--border-primary)] flex items-center justify-center overflow-hidden">
              <UserIcon size={20} className="text-[var(--text-secondary)]" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest leading-tight">{user.role}</p>
              <p className="text-xs text-[var(--text-secondary)] font-bold truncate max-w-[120px] uppercase tracking-tighter">{user.nombre}</p>
            </div>

            <button
              onClick={logout}
              className="group flex items-center justify-center p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-[var(--text-primary)] rounded-xl transition-all duration-300 shadow-xl shadow-rose-900/10 active:scale-90"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 transition-transform" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-[var(--text-muted)] font-black uppercase tracking-widest">Invitado</span>
        )}
      </div>
    </header>
  );
}
