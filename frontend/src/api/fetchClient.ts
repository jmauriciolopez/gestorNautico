const BASE_URL = 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchClient<T>(
  endpoint: string,
  { method = 'GET', body, headers = {} }: { method?: string; body?: any; headers?: Record<string, string> } = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Error en la petición API');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
