import api from './api'

export async function getSessionsRequest(limit = 10, offset = 0) {
  const response = await api.get(`/sessions?limit=${limit}&offset=${offset}`)
  return response.data
}

export async function getSessionByIdRequest(id) {
  const response = await api.get(`/sessions/${id}`)
  return response.data
}

export async function startSessionRequest(data) {
  const response = await api.post('/sessions', data)
  return response.data
}

export async function finishSessionRequest(id, data) {
  const response = await api.put(`/sessions/${id}/finish`, data)
  return response.data
}

export async function updateSessionExerciseRequest(sessionId, sessionExerciseId, data) {
  const response = await api.put(`/sessions/${sessionId}/exercises/${sessionExerciseId}`, data)
  return response.data
}

export async function addExerciseToSessionRequest(sessionId, data) {
  const response = await api.post(`/sessions/${sessionId}/exercises`, data)
  return response.data
}

export async function deleteSessionRequest(id) {
  const response = await api.delete(`/sessions/${id}`)
  return response.data
}