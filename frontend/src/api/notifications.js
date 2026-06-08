import api from './client';

export const listNotifications = () => api.get('/api/notifications/');
