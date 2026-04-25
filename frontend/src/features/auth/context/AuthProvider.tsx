import { useEffect, useState, type ReactNode } from 'react';
import { httpClient } from '../../../shared/api/HttpClient';
import { type User, Role } from '../../../types';
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
            
            // Sincronización de Tenant
            const currentTenant = localStorage.getItem('guarderiaId');
            
            // Si no es SuperAdmin, forzamos su guarderiaId asignado
            if (userData.role !== Role.SUPERADMIN && userData.guarderiaId) {
                if (currentTenant !== userData.guarderiaId.toString()) {
                    httpClient.setGuarderiaActiva(userData.guarderiaId);
                }
            } 
            // Si es SuperAdmin y no hay una activa, la dejamos en null (Global) o mantenemos la actual
            else if (userData.guarderiaId && !currentTenant) {
                httpClient.setGuarderiaActiva(userData.guarderiaId);
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('guarderiaId');
            setUser(null);
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        httpClient.setUnauthorizedCallback(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('guarderiaId');
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
        localStorage.removeItem('guarderiaId');
        setUser(null);
        httpClient.post('/auth/logout').catch(() => {});
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isInitializing,
            login,
            signup: login, // Por ahora el flujo es idéntico al login una vez obtenido el token
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};