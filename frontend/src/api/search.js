import api from './client';

export const searchProviders = (params) => api.get('/api/search/', { params });
