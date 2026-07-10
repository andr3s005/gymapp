import api from './api'

export async function getFoodsRequest({ search, barcode } = {}) {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (barcode) params.append('barcode', barcode)
  const response = await api.get(`/foods?${params.toString()}`)
  return response.data
}

export async function createFoodRequest(data) {
  const response = await api.post('/foods', data)
  return response.data
}

export async function getNutritionLogsRequest(date) {
  const params = date ? `?date=${date}` : ''
  const response = await api.get(`/nutrition${params}`)
  return response.data
}

export async function getDailySummaryRequest(date) {
  const response = await api.get(`/nutrition/summary/${date}`)
  return response.data
}

export async function addNutritionLogRequest(data) {
  const response = await api.post('/nutrition', data)
  return response.data
}

export async function removeNutritionLogItemRequest(logItemId) {
  const response = await api.delete(`/nutrition/${logItemId}`)
  return response.data
}

export async function getWaterLogRequest(date) {
  const response = await api.get(`/nutrition/water/${date}`)
  return response.data
}

export async function logWaterRequest(amount_ml) {
  const response = await api.post('/nutrition/water', { amount_ml })
  return response.data
}

export async function getRecipesRequest() {
  const response = await api.get('/recipes')
  return response.data
}