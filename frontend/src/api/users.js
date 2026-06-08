import api from './client';

export const getMe = () => api.get('/api/users/me/');
export const updateMe = (data) => api.patch('/api/users/me/', data);
export const listAddresses = () => api.get('/api/users/me/addresses/');
export const createAddress = (data) => api.post('/api/users/me/addresses/', data);
export const deleteAddress = (id) => api.delete(`/api/users/me/addresses/${id}/`);
