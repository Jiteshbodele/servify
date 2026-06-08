import api from './client';

export const createOrder = (data) => api.post('/api/payment/create-order/', data);
export const verifyPayment = (data) => api.post('/api/payment/verify/', data);
export const listTransactions = () => api.get('/api/payment/transactions/');
