import api from './api'

export async function getMeasurementsRequest(limit = 10) {
  const response = await api.get(`/progress/measurements?limit=${limit}`)
  return response.data
}

export async function createMeasurementRequest(data) {
  const response = await api.post('/progress/measurements', data)
  return response.data
}

export async function deleteMeasurementRequest(id) {
  const response = await api.delete(`/progress/measurements/${id}`)
  return response.data
}

export async function getPhotosRequest() {
  const response = await api.get('/progress/photos')
  return response.data
}

export async function createPhotoRequest(data) {
  const response = await api.post('/progress/photos', data)
  return response.data
}

export async function updatePhotoPrivacyRequest(id, isShared) {
  const response = await api.put(`/progress/photos/${id}/share`, {
    is_shared_with_coach: isShared,
  })
  return response.data
}

export async function deletePhotoRequest(id) {
  const response = await api.delete(`/progress/photos/${id}`)
  return response.data
}

export async function getUploadUrlRequest(filename, contentType) {
  const response = await api.post('/progress/upload-url', {
    filename,
    content_type: contentType,
  })
  return response.data
}