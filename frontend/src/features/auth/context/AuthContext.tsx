import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { type User } from '../../../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (token?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const verifySession = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsInitializing(false);
            return;
        }

        try {
            const userData = await httpClient.get<User>('/auth/me');
            setUser(userData);
        } catch (error) {
            console.error('Error verificando sesión:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        httpClient.setUnauthorizedCallback(() => {
            localStorage.removeItem('token');
            setUser(null);
        });

        verifySession();
    }, []);

    const login = async (token?: string) => {
        if (token) {
            localStorage.setItem('token', token);
        }
        await verifySession();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Opcional: Llamar a /auth/logout en el back
        httpClient.post('/auth/logout').catch(() => {});
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};