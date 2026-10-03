import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

export function getApiErrorMessage(error, fallback = 'Request failed') {
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.message
    return message ? `${message} (${status})` : `Server returned ${status}`
  }

  if (error.request) {
    return 'Network error: unable to reach the API. Check that the backend and MongoDB are running.'
  }

  return error.message || fallback
}

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  stock: (id, data) => api.post(`/products/${id}/stock`, data),
  movements: (id) => api.get(`/products/${id}/movements`),
  dashboard: () => api.get('/dashboard/inventory')
}
export default api
