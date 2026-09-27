import axiosClient from './axiosClient';

export const productApi = {
  list: (params) => axiosClient.get('/products', { params }),
  getById: (id) => axiosClient.get(`/products/${id}`),
  create: (payload) => axiosClient.post('/products', payload),
  update: (id, payload) => axiosClient.put(`/products/${id}`, payload),
  remove: (id) => axiosClient.delete(`/products/${id}`),
  adjustStock: (id, payload) => axiosClient.post(`/products/${id}/stock`, payload),
  getMovements: (id, params) => axiosClient.get(`/products/${id}/movements`, { params }),
};

export const dashboardApi = {
  getInventorySummary: () => axiosClient.get('/dashboard/inventory'),
};
