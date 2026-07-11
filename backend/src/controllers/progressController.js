const { supabaseAdmin } = require('../config/supabase');

// GET /api/progress/measurements — historial de medidas
async function getMeasurements(req, res) {
  const { limit = 10 } = req.query

  const { data, error } = await supabaseAdmin
    .from('body_measurements')
    .select('*')
    .eq('user_id', req.user.id)
    .order('measured_at', { ascending: false })
    .limit(Number(limit))

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ measurements: data })
}

// POST /api/progress/measurements — registrar medidas
async function createMeasurement(req, res) {
  const {
    measured_at,
    weight_kg,
    body_fat_pct,
    chest_cm,
    waist_cm,
    hips_cm,
    bicep_cm,
    thigh_cm,
    notes,
  } = req.body

  // Al menos una medida debe estar presente
  const hasMeasurement = [
    weight_kg, body_fat_pct, chest_cm,
    waist_cm, hips_cm, bicep_cm, thigh_cm
  ].some((v) => v !== undefined && v !== null && v !== '')

  if (!hasMeasurement) {
    return res.status(400).json({ error: 'Debes registrar al menos una medida' })
  }

  const { data, error } = await supabaseAdmin
    .from('body_measurements')
    .insert({
      user_id: req.user.id,
      measured_at: measured_at || new Date().toISOString().split('T')[0],
      weight_kg: weight_kg ? Number(weight_kg) : null,
      body_fat_pct: body_fat_pct ? Number(body_fat_pct) : null,
      chest_cm: chest_cm ? Number(chest_cm) : null,
      waist_cm: waist_cm ? Number(waist_cm) : null,
      hips_cm: hips_cm ? Number(hips_cm) : null,
      bicep_cm: bicep_cm ? Number(bicep_cm) : null,
      thigh_cm: thigh_cm ? Number(thigh_cm) : null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({ message: 'Medidas registradas correctamente', measurement: data })
}

// DELETE /api/progress/measurements/:id
async function deleteMeasurement(req, res) {
  const { id } = req.params

  const { data: existing, error: findError } = await supabaseAdmin
    .from('body_measurements')
    .select('user_id')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Medida no encontrada' })
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta medida' })
  }

  const { error } = await supabaseAdmin
    .from('body_measurements')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Medida eliminada correctamente' })
}

// GET /api/progress/photos — fotos de progreso
async function getPhotos(req, res) {
  const { data, error } = await supabaseAdmin
    .from('progress_photos')
    .select('*')
    .eq('user_id', req.user.id)
    .order('taken_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ photos: data })
}

// POST /api/progress/photos — registrar foto de progreso
async function createPhoto(req, res) {
  const { photo_url, angle, taken_at, notes, is_shared_with_coach } = req.body

  if (!photo_url || !angle) {
    return res.status(400).json({ error: 'photo_url y angle son obligatorios' })
  }

  const validAngles = ['front', 'side', 'back']
  if (!validAngles.includes(angle)) {
    return res.status(400).json({ error: 'angle debe ser front, side o back' })
  }

  const { data, error } = await supabaseAdmin
    .from('progress_photos')
    .insert({
      user_id: req.user.id,
      photo_url,
      angle,
      taken_at: taken_at || new Date().toISOString().split('T')[0],
      notes: notes || null,
      is_shared_with_coach: is_shared_with_coach || false,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({ message: 'Foto registrada correctamente', photo: data })
}

// PUT /api/progress/photos/:id/share — cambiar privacidad de foto
async function updatePhotoPrivacy(req, res) {
  const { id } = req.params
  const { is_shared_with_coach } = req.body

  const { data: existing, error: findError } = await supabaseAdmin
    .from('progress_photos')
    .select('user_id')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Foto no encontrada' })
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta foto' })
  }

  const { data, error } = await supabaseAdmin
    .from('progress_photos')
    .update({ is_shared_with_coach })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Privacidad actualizada', photo: data })
}

// DELETE /api/progress/photos/:id
async function deletePhoto(req, res) {
  const { id } = req.params

  const { data: existing, error: findError } = await supabaseAdmin
    .from('progress_photos')
    .select('user_id, photo_url')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Foto no encontrada' })
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta foto' })
  }

  const { error } = await supabaseAdmin
    .from('progress_photos')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Foto eliminada correctamente' })
}

// GET /api/progress/storage-url — obtener URL firmada para subir foto a Supabase Storage
async function getUploadUrl(req, res) {
  const { filename, content_type } = req.body

  if (!filename || !content_type) {
    return res.status(400).json({ error: 'filename y content_type son obligatorios' })
  }

  const path = `${req.user.id}/${Date.now()}_${filename}`

  const { data, error } = await supabaseAdmin
    .storage
    .from('progress-photos')
    .createSignedUploadUrl(path)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // URL pública para acceder a la foto después de subirla
  const { data: publicData } = supabaseAdmin
    .storage
    .from('progress-photos')
    .getPublicUrl(path)

  res.json({
    upload_url: data.signedUrl,
    token: data.token,
    path,
    public_url: publicData.publicUrl,
  })
}

module.exports = {
  getMeasurements,
  createMeasurement,
  deleteMeasurement,
  getPhotos,
  createPhoto,
  updatePhotoPrivacy,
  deletePhoto,
  getUploadUrl,
}