import api from './api'

export async function getRoutinesRequest() {
  const response = await api.get('/routines')
  return response.data
}

export async function createRoutineRequest(data) {
  const response = await api.post('/routines', data)
  return response.data
}

export async function updateRoutineRequest(id, data) {
  const response = await api.put(`/routines/${id}`, data)
  return response.data
}

export async function deleteRoutineRequest(id) {
  const response = await api.delete(`/routines/${id}`)
  return response.data
}

export async function addExerciseToRoutineRequest(routineId, data) {
  const response = await api.post(`/routines/${routineId}/exercises`, data)
  return response.data
}

export async function removeExerciseFromRoutineRequest(routineId, routineExerciseId) {
  const response = await api.delete(`/routines/${routineId}/exercises/${routineExerciseId}`)
  return response.data
}

export async function updateRoutineExerciseRequest(routineId, routineExerciseId, data) {
  const response = await api.put(`/routines/${routineId}/exercises/${routineExerciseId}`, data)
  return response.data
}