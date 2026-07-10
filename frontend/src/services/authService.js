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

export async function updateProfileRequest(data) {
  const response = await api.put('/auth/profile', data)
  return response.data
}

export async function updatePasswordRequest(data) {
  const response = await api.put('/auth/password', data)
  return response.data
}