import api from './api'

export async function getExercisesRequest(filters = {}) {
  const params = new URLSearchParams()
  if (filters.muscle_group) params.append('muscle_group', filters.muscle_group)
  if (filters.category) params.append('category', filters.category)

  const response = await api.get(`/exercises?${params.toString()}`)
  return response.data
}

export async function createExerciseRequest(exerciseData) {
  const response = await api.post('/exercises', exerciseData)
  return response.data
}

export async function updateExerciseRequest(id, data) {
  const response = await api.put(`/exercises/${id}`, data)
  return response.data
}

export async function deleteExerciseRequest(id) {
  const response = await api.delete(`/exercises/${id}`)
  return response.data
}