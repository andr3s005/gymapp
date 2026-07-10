const { supabaseAdmin } = require('../config/supabase');

// GET /api/coaches — lista todos los coaches con su disponibilidad
async function getCoaches(req, res) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      specialty,
      avatar_url,
      coach_availability (
        id,
        day_of_week,
        start_time,
        end_time
      )
    `)
    .eq('role', 'coach')
    .order('full_name')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ coaches: data })
}

// GET /api/coaches/:id — perfil completo de un coach
async function getCoachById(req, res) {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      specialty,
      avatar_url,
      coach_availability (
        id,
        day_of_week,
        start_time,
        end_time
      ),
      coach_assignments!coach_id (
        id,
        active,
        assigned_at,
        profiles!client_id (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('id', id)
    .eq('role', 'coach')
    .single()

  if (error) {
    return res.status(404).json({ error: 'Coach no encontrado' })
  }

  res.json({ coach: data })
}

// POST /api/coaches/:id/availability — coach define su disponibilidad
async function setAvailability(req, res) {
  const { id } = req.params
  const { availability } = req.body

  // Solo el propio coach o un admin puede definir su disponibilidad
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta disponibilidad' })
  }

  if (!Array.isArray(availability) || availability.length === 0) {
    return res.status(400).json({ error: 'availability debe ser un array con al menos un horario' })
  }

  // Borramos la disponibilidad anterior y la reemplazamos completa
  const { error: deleteError } = await supabaseAdmin
    .from('coach_availability')
    .delete()
    .eq('coach_id', id)

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message })
  }

  const rows = availability.map((slot) => ({
    coach_id: id,
    day_of_week: slot.day_of_week,
    start_time: slot.start_time,
    end_time: slot.end_time,
  }))

  const { data, error } = await supabaseAdmin
    .from('coach_availability')
    .insert(rows)
    .select()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Disponibilidad actualizada correctamente', availability: data })
}

// POST /api/coaches/assign — usuario elige su coach
async function assignCoach(req, res) {
  const { coach_id } = req.body
  const client_id = req.user.id

  if (!coach_id) {
    return res.status(400).json({ error: 'coach_id es obligatorio' })
  }

  // Verificar que el coach existe
  const { data: coach, error: coachError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, specialty')
    .eq('id', coach_id)
    .eq('role', 'coach')
    .single()

  if (coachError) {
    return res.status(404).json({ error: 'Coach no encontrado' })
  }

  // Verificar membresía activa del usuario
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('memberships')
    .select('id, plan_type, status, coach_included, app_access')
    .eq('user_id', client_id)
    .in('status', ['active', 'grace_period'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (membershipError || !membership) {
    return res.status(403).json({ error: 'Necesitas una membresía activa para asignar un coach' })
  }

  // Verificar si el plan permite coach
  const plansWithoutCoach = ['daily', 'weekly']
  if (plansWithoutCoach.includes(membership.plan_type)) {
    return res.status(403).json({
      error: 'Tu plan actual no incluye acceso a coach. Actualiza tu membresía para acceder a este servicio'
    })
  }

  // Verificar si ya tiene un coach asignado y si puede cambiarlo
  const { data: currentAssignment } = await supabaseAdmin
    .from('coach_assignments')
    .select('id, coach_id, assigned_at')
    .eq('client_id', client_id)
    .eq('active', true)
    .single()

  if (currentAssignment) {
    // Si el coach es el mismo, no hacer nada
    if (currentAssignment.coach_id === coach_id) {
      return res.status(400).json({ error: 'Ya tienes este coach asignado' })
    }

    // Verificar si estamos en el primer día del mes (permitido cambiar)
    const today = new Date()
    const isFirstOfMonth = today.getDate() === 1

    if (!isFirstOfMonth) {
      const nextFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      const daysUntilChange = Math.ceil((nextFirst - today) / (1000 * 60 * 60 * 24))
      return res.status(403).json({
        error: `Solo puedes cambiar de coach el primer día de cada mes. Faltan ${daysUntilChange} días para poder cambiar`
      })
    }
  }

  // Desactivar asignación anterior si existe
  if (currentAssignment) {
    await supabaseAdmin
      .from('coach_assignments')
      .update({ active: false })
      .eq('client_id', client_id)
      .eq('active', true)
  }

  // Crear nueva asignación
  const { data, error } = await supabaseAdmin
    .from('coach_assignments')
    .insert({
      coach_id,
      client_id,
      active: true,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({
    message: `Coach ${coach.full_name} asignado correctamente`,
    assignment: data,
    coach_included: membership.coach_included,
  })
}

// DELETE /api/coaches/assign — usuario quita su coach
async function unassignCoach(req, res) {
  const client_id = req.user.id

  const { error } = await supabaseAdmin
    .from('coach_assignments')
    .update({ active: false })
    .eq('client_id', client_id)
    .eq('active', true)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Coach desasignado correctamente' })
}

// GET /api/coaches/my-clients — coach ve su lista de clientes
async function getMyClients(req, res) {
  if (req.user.role !== 'coach') {
    return res.status(403).json({ error: 'Solo los coaches pueden ver sus clientes' })
  }

  const { data, error } = await supabaseAdmin
    .from('coach_assignments')
    .select(`
      id,
      assigned_at,
      profiles!client_id (
        id,
        full_name,
        email,
        goal,
        memberships (
          status,
          plan_type,
          end_date,
          app_access
        )
      )
    `)
    .eq('coach_id', req.user.id)
    .eq('active', true)
    .order('assigned_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ clients: data })
}

module.exports = {
  getCoaches,
  getCoachById,
  setAvailability,
  assignCoach,
  unassignCoach,
  getMyClients,
}