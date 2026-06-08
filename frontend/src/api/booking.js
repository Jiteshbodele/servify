import api from './client';

export const listProviderServices = (serviceId) =>
  api.get('/api/booking/provider-services/', {
    params: serviceId ? { service_id: serviceId } : {},
  });
export const listMyProviderServices = () =>
  api.get('/api/booking/provider-services/mine/');
export const createProviderService = (data) =>
  api.post('/api/booking/provider-services/', data);
export const addAvailability = (data) => api.post('/api/booking/availability/', data);
export const getAvailableSlots = (providerServiceId, date) =>
  api.get('/api/booking/available-slots/', {
    params: { provider_service_id: providerServiceId, date },
  });
export const createBooking = (data) => api.post('/api/booking/', data);
export const listBookings = (page = 1, pageSize = 10) =>
  api.get('/api/booking/list/', { params: { page, page_size: pageSize } });
export const getBooking = (id) => api.get(`/api/booking/${id}/`);
export const updateBookingStatus = (id, status) =>
  api.patch(`/api/booking/${id}/status/`, { status });
