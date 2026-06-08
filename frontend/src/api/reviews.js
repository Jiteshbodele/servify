import api from './client';

export const createReview = (data) => api.post('/api/reviews/', data);
export const getReviews = (targetId, targetType = 'provider') =>
  api.get('/api/reviews/', { params: { target_id: targetId, target_type: targetType } });
