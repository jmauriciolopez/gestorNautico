import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User, UserRole } from '../../types';

interface Props {
    initialData?: User | null;
    onSubmit: (data: Partial<User>) => void;
    onCancel: () => void;
}

const emptyForm = {
    nombre: '',
    apellido: '',
    usuario: '',
    email: '',
    clave: '',
    repetirClave: '',
    activo: true,
    rol: 'periodista' as UserRole,
    permisoCrearNoticias: false,
    permisoEditarNoticias: false,
    permisoEliminarNoticias: false,
    permisoPreportada: false,
    permisoComentarios: false
};

function userToFormData(u: User | null | undefined): typeof emptyForm {
    if (!u) return emptyForm;
    return {
        nombre: u.nombre ?? '',
        apellido: u.apellido ?? '',
        usuario: u.usuario ?? '',
        email: u.email ?? '',
        clave: '',
        repetirClave: '',
        activo: u.activo ?? true,
        rol: u.rol ?? 'periodista',
        permisoCrearNoticias: u.permisoCrearNoticias ?? false,
        permisoEditarNoticias: u.permisoEditarNoticias ?? false,
        permisoEliminarNoticias: u.permisoEliminarNoticias ?? false,
        permisoPreportada: u.permisoPreportada ?? false,
        permisoComentarios: u.permisoComentarios ?? false,
    };
}

export function UserForm({ initialData, onSubmit, onCancel }: Props) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(() => userToFormData(initialData));



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.clave !== formData.repetirClave) {
            alert(t('user_form.errors.passwords_dont_match'));
            return;
        }

        const { ...payload } = formData;

        // Al editar, si la clave está vacía, no la enviamos para no sobrescribir con vacío
        if (initialData && !payload.clave) {
            delete (payload as Partial<User>).clave;
        }
        onSubmit(payload as Partial<User>);
    };

    return (
        <div className="form-panel animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title={t('user_form.actions.cancel')} onClick={onCancel}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h3 style={{ fontSize: '1.25rem' }}>{initialData ? t('user_form.title_edit') : t('user_form.title_new')}</h3>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                    <label>{t('user_form.first_name')}</label>
                    <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder={t('user_form.first_name_placeholder')}
                    />
                </div>

                <div className="form-group">
                    <label>{t('user_form.last_name')}</label>
                    <input
                        type="text"
                        required
                        value={formData.apellido}
                        onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                        placeholder={t('user_form.last_name_placeholder')}
                    />
                </div>

                <div className="form-group">
                    <label>{t('user_form.email')}</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('user_form.email_placeholder')}
                    />
                </div>

                <div className="form-group">
                    <label>{t('user_form.username')}</label>
                    <input
                        type="text"
                        required
                        value={formData.usuario}
                        onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                        placeholder={t('user_form.username_placeholder')}
                    />
                </div>

                <div className="form-group">
                    <label>{t('user_form.password')} {initialData ? t('user_form.password_helper') : '*'}</label>
                    <input
                        type="password"
                        required={!initialData}
                        value={formData.clave}
                        onChange={e => setFormData({ ...formData, clave: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>{t('user_form.repeat_password')} {initialData ? t('user_form.password_helper') : '*'}</label>
                    <input
                        type="password"
                        required={!initialData}
                        value={formData.repetirClave}
                        onChange={e => setFormData({ ...formData, repetirClave: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>{t('user_form.role')}</label>
                    <select
                        required
                        value={formData.rol}
                        onChange={e => {
                            const newRol = e.target.value as UserRole;
                            const isPrivileged = newRol === 'admin' || newRol === 'superadmin';
                            setFormData({ 
                                ...formData, 
                                rol: newRol,
                                // Si es admin/superadmin, forzamos todos los permisos a true
                                permisoCrearNoticias: isPrivileged ? true : formData.permisoCrearNoticias,
                                permisoEditarNoticias: isPrivileged ? true : formData.permisoEditarNoticias,
                                permisoEliminarNoticias: isPrivileged ? true : formData.permisoEliminarNoticias,
                                permisoPreportada: isPrivileged ? true : formData.permisoPreportada,
                                permisoComentarios: isPrivileged ? true : formData.permisoComentarios
                            });
                        }}
                    >
                        <option value="periodista">{t('users.table.roles.periodista')}</option>
                        <option value="admin">{t('users.table.roles.admin')}</option>
                        <option value="superadmin">{t('users.table.roles.superadmin')}</option>
                    </select>
                </div>

                {formData.rol === 'periodista' && (
                    <div className="form-group full-width" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>{t('user_form.permissions_title')}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.permisoCrearNoticias}
                                onChange={e => setFormData({ ...formData, permisoCrearNoticias: e.target.checked })}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <span>{t('user_form.permissions.create_news')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.permisoEditarNoticias}
                                onChange={e => setFormData({ ...formData, permisoEditarNoticias: e.target.checked })}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <span>{t('user_form.permissions.edit_news')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.permisoEliminarNoticias}
                                onChange={e => setFormData({ ...formData, permisoEliminarNoticias: e.target.checked })}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <span>{t('user_form.permissions.delete_news')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.permisoPreportada}
                                onChange={e => setFormData({ ...formData, permisoPreportada: e.target.checked })}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <span>{t('user_form.permissions.manage_preportada')}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.permisoComentarios}
                                onChange={e => setFormData({ ...formData, permisoComentarios: e.target.checked })}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <span>{t('user_form.permissions.moderate_comments')}</span>
                        </label>
                    </div>
                </div>
                )}

                <div className="form-group full-width" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.activo}
                            onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                            style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span>{t('user_form.active')}</span>
                    </label>
                </div>

                <div className="full-width form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('user_form.actions.cancel')}</button>
                    <button type="submit" className="btn btn-primary">{initialData ? t('user_form.actions.submit_edit') : t('user_form.actions.submit_new')}</button>
                </div>
            </form>
        </div>
    );
}
