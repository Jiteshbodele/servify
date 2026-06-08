import api from './client';

export const register = (data) => api.post('/api/auth/register/', data);
export const login = (data) => api.post('/api/auth/login/', data);
export const refresh = (refreshToken) =>
  api.post('/api/auth/refresh/', { refresh: refreshToken });
export const logout = (refreshToken) =>
  api.post('/api/auth/logout/', { refresh: refreshToken });
export const changePassword = (data) =>
  api.post('/api/auth/change-password/', data);
