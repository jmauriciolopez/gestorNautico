export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Selector para react-query: extrae solo el array `data` de una respuesta paginada */
export const selectData = <T>(res: Paginated<T>): T[] => res.data;
