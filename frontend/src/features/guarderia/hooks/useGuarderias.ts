import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { Guarderia, Role } from '../../../types';

/**
 * Hook para obtener la lista de todas las guarderías (solo SUPERADMIN)
 */
export const useGuarderias = () => {
    const { user } = useAuth();
    
    return useQuery({
        queryKey: ['guarderias'],
        queryFn: () => httpClient.get<Guarderia[]>('/guarderias'),
        enabled: user?.role === Role.SUPERADMIN,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};
