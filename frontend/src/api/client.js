import axios from 'axios';

/** In dev, use same-origin + Vite proxy. In prod, use VITE_API_BASE_URL. */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return import.meta.env.DEV ? '' : 'http://localhost:8000';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return Promise.reject(error);

      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${getApiBaseUrl()}/api/auth/refresh/`, { refresh })
            .then((r) => {
              const access = r.data.access;
              localStorage.setItem('access_token', access);
              return access;
            })
            .finally(() => {
              refreshing = null;
            });
        }
        const access = await refreshing;
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a human-readable message from API errors (incl. gateway `{ success, error }` wrapper). */
function parseApiErrorBody(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;

  // Microservices wrap DRF errors: { success: false, error: ... }
  const body = data.error !== undefined ? data.error : data;

  if (typeof body === 'string') return body;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body)) return body[0];
  if (Array.isArray(body.non_field_errors)) return body.non_field_errors[0];

  if (typeof body === 'object' && body !== null) {
    for (const val of Object.values(body)) {
      if (typeof val === 'string') return val;
      if (Array.isArray(val) && val.length) return val[0];
    }
  }
  return null;
}

export function getErrorMessage(err) {
  if (err.code === 'ERR_NETWORK' || !err.response) {
    return 'Network error — is the backend running on port 8000? (docker-compose up)';
  }
  const parsed = parseApiErrorBody(err.response?.data);
  if (parsed) return parsed;
  return err.message || 'Request failed';
}

export default api;
