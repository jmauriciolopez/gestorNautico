import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { httpClient } from '../../shared/api/HttpClient';

interface Props {
    onLoginSuccess: (token?: string) => void | Promise<void>;
}

export function Login({ onLoginSuccess }: Props) {
    const { t } = useTranslation();
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
            // httpClient ya tiene configurado credentials: 'include'
            const response = await httpClient.post<{ accessToken: string }>('/auth/login', { nombre: usuario, password });
            onLoginSuccess(response.accessToken);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('login_page.error'));
        } finally {
            setLoading(false);
        }
    };
    const handleShortcut = () => {
        if (window.location.hostname === 'localhost') {
            setUsuario('jmauricio_lopez@hotmail.com');
            setPassword('1');
        }
    };
    return (
        <div className="login-container">
            <div className="login-card animate-fade-in">
                <div className="login-header">
                    <div className="logo" onClick={handleShortcut} style={{ cursor: window.location.hostname === 'localhost' ? 'pointer' : 'default' }}>
                        Gestor<span>Noticias</span>
                    </div>
                    <h1>{t('login_page.title')}</h1>
                    <p>{t('login_page.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="usuario">{t('login_page.username')}</label>
                        <input
                            id="usuario"
                            type="text"
                            required
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('login_page.password')}</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label={showPassword ? t('common.hide_password', 'Ocultar contraseña') : t('common.view_password', 'Ver contraseña')}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? t('login_page.logging_in') : t('login_page.submit')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>&copy; 2026 Admin Panel. Todos los derechos reservados.</p>
                </div>
            </div>

            <style>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    padding: 1.5rem;
                }

                .login-card {
                    background: white;
                    width: 100%;
                    max-width: 400px;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .login-header .logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 1rem;
                    display: inline-block;
                }

                .login-header .logo span {
                    color: var(--text-dark);
                }

                .login-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-dark);
                    margin-bottom: 0.5rem;
                }

                .login-header p {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                .login-form .form-group {
                    margin-bottom: 1.25rem;
                }

                .login-form label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-dark);
                    margin-bottom: 0.5rem;
                }

                .login-form input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .login-form input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .password-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-input-wrapper input {
                    padding-right: 3rem;
                }

                .password-toggle {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.25rem;
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: var(--primary);
                }

                .login-error {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    border: 1px solid #fee2e2;
                }

                .btn-block {
                    width: 100%;
                    margin-top: 1rem;
                }

                .login-footer {
                    margin-top: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
