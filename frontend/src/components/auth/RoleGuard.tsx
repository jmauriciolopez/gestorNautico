import { ReactNode } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Role } from '../../types';

interface RoleGuardProps {
    allowedRoles: Role[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * RoleGuard
 * 
 * Un componente envoltorio que renderiza sus hijos solo si el usuario
 * autenticado tiene uno de los roles permitidos.
 */
export const RoleGuard = ({ allowedRoles, children, fallback = null }: RoleGuardProps) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    if (!allowedRoles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
