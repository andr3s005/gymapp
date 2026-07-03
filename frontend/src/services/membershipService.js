import api from './api'

export async function getMembershipsRequest() {
  const response = await api.get('/memberships')
  return response.data
}

export async function createMembershipRequest(data) {
  const response = await api.post('/memberships', data)
  return response.data
}

export async function updateMembershipStatusRequest(id, status, gracePeriodEnd = null) {
  const response = await api.put(`/memberships/${id}/status`, {
    status,
    grace_period_end: gracePeriodEnd,
  })
  return response.data
}

export async function renewMembershipRequest(id, data) {
  const response = await api.post(`/memberships/${id}/renew`, data)
  return response.data
}

export async function checkMembershipStatusRequest(userId) {
  const response = await api.get(`/memberships/check/${userId}`)
  return response.data
}