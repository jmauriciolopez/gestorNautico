import { useTranslation } from 'react-i18next';
import type { User, UserRole } from '../../types';

interface Props {
    users: User[];
    onEdit: (u: User) => void;
    onDelete: (id: number) => void;
    onCreateClick: () => void;
}

export function UserList({ users, onEdit, onDelete, onCreateClick }: Props) {
    const { t } = useTranslation();
    const getRoleBadgeClass = (rol: UserRole) => {
        switch (rol) {
            case 'superadmin': return 'status-published';
            case 'admin': return 'status-published';
            case 'periodista': return 'status-draft';
            default: return 'status-draft';
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="controls-row">
                <h3 style={{ fontSize: '1.25rem' }}>{t('users.title')}</h3>
                <button className="btn btn-primary" onClick={onCreateClick}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    {t('users.create')}
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('users.table.user')}</th>
                            <th>{t('users.table.role')}</th>
                            <th>{t('users.table.status')}</th>
                            <th>{t('users.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.nombre} {u.apellido}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.usuario} | {u.email}</div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${getRoleBadgeClass(u.rol)}`} style={{ textTransform: 'capitalize' }}>
                                        {t(`users.table.roles.${u.rol}`)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${u.activo ? 'status-published' : 'status-danger'}`}>
                                        {u.activo ? t('users.table.active') : t('users.table.inactive')}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '0.5rem' }} onClick={() => onEdit(u)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.5rem' }} onClick={() => onDelete(u.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('users.table.no_items')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
