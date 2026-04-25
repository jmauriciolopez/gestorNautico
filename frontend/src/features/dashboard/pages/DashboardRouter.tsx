import { useState } from 'react';
import { LayoutDashboard, Wrench } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Role } from '../../../types';
import Dashboard from './Dashboard';
import DashboardOperativo from './DashboardOperativo';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const isOperador = user?.role === Role.OPERADOR;

  const [view, setView] = useState<'completo' | 'operativo'>(
    isOperador ? 'operativo' : 'completo'
  );

  if (isOperador) {
    return <DashboardOperativo />;
  }

  return (
    <div className="space-y-4">
      <div
        className="inline-flex items-center gap-1 p-1 rounded-[14px]"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <button
          onClick={() => setView('completo')}
          className="btn"
          style={{
            minHeight: 36,
            padding: '0 14px',
            background:
              view === 'completo'
                ? 'var(--accent-primary-soft)'
                : 'transparent',
            color:
              view === 'completo'
                ? 'var(--accent-primary)'
                : 'var(--text-secondary)',
            borderColor:
              view === 'completo'
                ? 'color-mix(in srgb, var(--accent-primary) 24%, transparent)'
                : 'transparent',
          }}
        >
          <LayoutDashboard size={15} />
          Gerencial
        </button>

        <button
          onClick={() => setView('operativo')}
          className="btn"
          style={{
            minHeight: 36,
            padding: '0 14px',
            background:
              view === 'operativo'
                ? 'var(--accent-teal-soft)'
                : 'transparent',
            color:
              view === 'operativo'
                ? 'var(--accent-teal)'
                : 'var(--text-secondary)',
            borderColor:
              view === 'operativo'
                ? 'color-mix(in srgb, var(--accent-teal) 24%, transparent)'
                : 'transparent',
          }}
        >
          <Wrench size={15} />
          Operativo
        </button>
      </div>

      {view === 'completo' ? <Dashboard /> : <DashboardOperativo />}
    </div>
  );
};

export default DashboardRouter;