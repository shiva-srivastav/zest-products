import api from './axios'

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),

  getItems: (productId, params) => api.get(`/products/${productId}/items`, { params }),
  addItem: (productId, data) => api.post(`/products/${productId}/items`, data),
  updateItem: (productId, itemId, data) => api.put(`/products/${productId}/items/${itemId}`, data),
  deleteItem: (productId, itemId) => api.delete(`/products/${productId}/items/${itemId}`),
}
