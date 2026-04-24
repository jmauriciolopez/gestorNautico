import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Guarderia } from '../../../types';

/**
 * Hook para obtener la lista de todas las guarderías (solo SUPERADMIN)
 */
export const useGuarderias = () => {
    return useQuery({
        queryKey: ['guarderias'],
        queryFn: () => httpClient.get<Guarderia[]>('/guarderias'),
        // Solo cargar si el usuario es SUPERADMIN o si explícitamente se necesita
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};
