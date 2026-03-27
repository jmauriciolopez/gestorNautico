import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { type User } from '../../../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (token?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const userData = await httpClient.get<User>('/auth/me');
                setUser(userData);
            } catch {
                setUser(null);
            } finally {
                setIsInitializing(false);
            }
        };

        httpClient.setUnauthorizedCallback(() => {
            setUser(null);
        });

        verifySession();
    }, []); // Corregido: dependía de [user] causando loop infinito

    const login = async (token?: string) => {
        try {
            if (token) {
                localStorage.setItem('token', token);
            }
            const userData = await httpClient.get<User>('/auth/me');
            setUser(userData);
        } catch (error) {
            console.error('Error al obtener datos tras login:', error);
            localStorage.removeItem('token');
        }
    };

    const logout = async () => {
        try {
            await httpClient.post('/auth/logout');
        } catch (error) {
            console.error('Error al cerrar sesión en el servidor:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isInitializing,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};