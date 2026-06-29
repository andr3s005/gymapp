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