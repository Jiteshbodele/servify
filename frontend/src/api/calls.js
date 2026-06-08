import api from './client';

export const initiateCall = (bookingId) =>
  api.post('/api/calls/', { booking_id: bookingId });
export const getCallHistory = (bookingId) =>
  api.get('/api/calls/', { params: bookingId ? { booking_id: bookingId } : {} });
export const getMyCallHistory = () => api.get('/api/calls/mine/');
