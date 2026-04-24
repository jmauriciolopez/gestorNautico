import { useEffect, useState, type ReactNode } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { type User } from '../../../types';
import { AuthContext } from './AuthContext';

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
            
            // Si el usuario tiene una guardería asignada y no hay una activa, la seteamos por defecto
            const currentTenant = localStorage.getItem('guarderiaId');
            if (userData.guarderiaId && !currentTenant) {
                httpClient.setGuarderiaActiva(userData.guarderiaId);
            }
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