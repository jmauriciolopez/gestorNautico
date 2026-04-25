import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../shared/api/HttpClient';
import { useDebounce } from './useDebounce';

export interface SearchResults {
  clientes: { id: number; nombre: string; dni: string; email: string }[];
  embarcaciones: { id: number; nombre: string; matricula: string; tipo: string; estado_operativo: string }[];
  racks: { id: number; codigo: string }[];
}

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 350);

  const { data, isLoading, isFetching } = useQuery<SearchResults>({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => httpClient.get<SearchResults>(`/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const hasResults =
    (data?.clientes.length ?? 0) +
    (data?.embarcaciones.length ?? 0) +
    (data?.racks.length ?? 0) > 0;

  return {
    results: data ?? { clientes: [], embarcaciones: [], racks: [] },
    isLoading: isLoading || isFetching,
    hasResults,
    isActive: debouncedQuery.trim().length >= 2,
  };
}
