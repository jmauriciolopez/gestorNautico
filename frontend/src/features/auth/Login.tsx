import { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, Ship } from 'lucide-react';
import { httpClient } from '../../shared/api/HttpClient';

interface Props {
    onLoginSuccess: (token?: string) => void | Promise<void>;
}

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
                password
            });
            onLoginSuccess(response.accessToken);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error de autenticación. Verifique sus credenciales.');
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
        <div className="login-container">
            {/* Background elements */}
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>

            <div className="login-card animate-fade-in">
                <div className="login-header">
                    <div className="logo-container" onClick={handleShortcut}>
                        <Ship className="logo-icon" size={32} />
                        <span className="logo-text">Gestor<span>Náutico</span></span>
                    </div>
                    <h1>Bienvenido</h1>
                    <p>Inicie sesión para gestionar su flota</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Usuario</label>
                        <div className="input-with-icon">
                            <UserIcon size={18} className="input-icon" />
                            <input
                                type="text"
                                required
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                placeholder="usuario@gestor.com"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>&copy; 2026 Gestor Náutico v2.0</p>
                </div>
            </div>

            <style>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #020617;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                }

                .bg-glow-1 {
                    position: absolute;
                    top: -10%;
                    right: -10%;
                    width: 50vw;
                    height: 50vw;
                    background: radial-gradient(circle, rgba(30, 64, 175, 0.15) 0%, transparent 70%);
                    z-index: 0;
                }

                .bg-glow-2 {
                    position: absolute;
                    bottom: -10%;
                    left: -10%;
                    width: 50vw;
                    height: 50vw;
                    background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
                    z-index: 0;
                }

                .login-card {
                    position: relative;
                    z-index: 10;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    width: 100%;
                    max-width: 420px;
                    padding: 3rem;
                    border-radius: 2rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    cursor: pointer;
                }

                .logo-icon {
                    color: #3b82f6;
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
                }

                .logo-text {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.025em;
                }

                .logo-text span {
                    color: #3b82f6;
                }

                .login-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .login-header p {
                    color: #94a3b8;
                    font-size: 0.95rem;
                }

                .login-form .form-group {
                    margin-bottom: 1.5rem;
                }

                .login-form label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #cbd5e1;
                    margin-bottom: 0.5rem;
                    padding-left: 0.25rem;
                }

                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: #64748b;
                    pointer-events: none;
                }

                .login-form input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1rem;
                    color: white;
                    font-size: 0.95rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .login-form input:focus {
                    outline: none;
                    background: rgba(30, 41, 59, 0.8);
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .password-toggle {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }

                .password-toggle:hover {
                    color: #3b82f6;
                    background: rgba(59, 130, 246, 0.1);
                }

                .error-alert {
                    background: rgba(220, 38, 38, 0.1);
                    color: #f87171;
                    padding: 1rem;
                    border-radius: 1rem;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }

                .login-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(to right, #2563eb, #3b82f6);
                    color: white;
                    border: none;
                    border-radius: 1rem;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
                    filter: brightness(1.1);
                }

                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                .login-footer {
                    margin-top: 2.5rem;
                    text-align: center;
                    color: #64748b;
                    font-size: 0.8rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }

                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}
