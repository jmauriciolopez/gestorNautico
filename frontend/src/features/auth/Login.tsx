import { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, KeyRound, Anchor, Waves, LayoutDashboard } from 'lucide-react';
import { httpClient } from '../../shared/api/HttpClient';

interface Props {
  onLoginSuccess: (token?: string) => void | Promise<void>;
}

const FEATURES = ['Flota en tiempo real', 'Multi-sede', 'Reportes', 'Espacios inteligentes', 'Panel de control', 'Facturación'];

export function Login({ onLoginSuccess }: Props) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await httpClient.post<{ accessToken: string }>('/auth/login', {
        nombre: usuario,
        password,
      });
      onLoginSuccess(response.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleShortcut = () => {
    if (window.location.hostname === 'localhost') {
      setUsuario('superadmin');
      setPassword('super123');
    }
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Orbs — sutiles, respetan el tema */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.06)', filter: 'blur(80px)' }}
      />

      {/* Panel izquierdo — branding */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-start px-16 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="p-3 rounded-2xl"
            style={{ background: 'var(--accent-primary)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}
          >
            <Anchor size={26} color="white" />
          </div>
          <span className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Gestor<span style={{ color: 'var(--accent-primary)' }}>Náutico</span>
          </span>
        </div>

        <h1
          className="font-black leading-none mb-4 max-w-lg"
          style={{ fontSize: '2.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}
        >
          Gestión inteligente para tu guardería náutica
        </h1>

        <p className="max-w-md leading-relaxed text-base" style={{ color: 'var(--text-secondary)' }}>
          Control total de embarcaciones, espacios, finanzas y operaciones desde un solo lugar.
        </p>

        <div className="flex flex-wrap gap-2 mt-8">
          {FEATURES.map(f => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <div className="flex gap-10 mt-12">
          {[
            { icon: Anchor, label: 'Embarcaciones', value: '∞' },
            { icon: Waves, label: 'Operaciones', value: '24/7' },
            { icon: LayoutDashboard, label: 'Dashboard', value: 'Live' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div
        className="w-full md:w-[460px] flex flex-col justify-center items-center px-8 md:px-12 relative z-10"
        style={{
          borderLeft: '1px solid var(--border-primary)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="w-full max-w-sm">

          {/* Logo shortcut */}
          <div
            className="flex items-center gap-3 mb-10 select-none"
            onClick={handleShortcut}
            style={{ cursor: window.location.hostname === 'localhost' ? 'pointer' : 'default' }}
          >
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'var(--accent-primary)' }}
            >
              <KeyRound size={18} color="white" />
            </div>
            <div>
              <p className="font-black text-sm leading-none" style={{ color: 'var(--text-primary)' }}>
                GestorNáutico
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Sistema de gestión
              </p>
            </div>
          </div>

          <h2 className="font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Bienvenido de vuelta
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Ingresá tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm text-center animate-shake"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            {/* Usuario */}
            <div className="relative">
              <UserIcon
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                required
                autoFocus
                placeholder="Usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Contraseña */}
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
              }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Iniciar Sesión'
              }
            </button>
          </form>

          <p className="text-center text-xs mt-10" style={{ color: 'var(--text-muted)' }}>
            © 2026 GestorNáutico · v2.0
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}
