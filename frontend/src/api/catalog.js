import api from './client';

export const listCategories = () => api.get('/api/catalog/categories/');
export const createCategory = (data) => api.post('/api/catalog/categories/', data);
export const listServices = (categoryId) =>
  api.get('/api/catalog/services/', {
    params: categoryId ? { category_id: categoryId } : {},
  });
export const createService = (data) => api.post('/api/catalog/services/', data);
