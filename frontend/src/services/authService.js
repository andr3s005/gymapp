import api from './api'

export async function loginRequest(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function registerRequest(userData) {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export async function getMeRequest() {
  const response = await api.get('/auth/me')
  return response.data
}