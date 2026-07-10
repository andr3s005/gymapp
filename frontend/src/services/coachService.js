import api from './api'

export async function getCoachesRequest() {
  const response = await api.get('/coaches')
  return response.data
}

export async function assignCoachRequest(coachId) {
  const response = await api.post('/coaches/assign', { coach_id: coachId })
  return response.data
}

export async function unassignCoachRequest() {
  const response = await api.delete('/coaches/assign')
  return response.data
}

export async function getMyClientsRequest() {
  const response = await api.get('/coaches/my-clients')
  return response.data
}

export async function setAvailabilityRequest(coachId, availability) {
  const response = await api.post(`/coaches/${coachId}/availability`, { availability })
  return response.data
}