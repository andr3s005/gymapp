const { supabaseAdmin } = require('../config/supabase');

// GET /api/sessions — historial de sesiones del usuario
async function getSessions(req, res) {
  const { limit = 10, offset = 0 } = req.query

  const { data, error } = await supabaseAdmin
    .from('workout_sessions')
    .select(`
      *,
      routines (id, name),
      session_exercises (
        id,
        set_number,
        reps_done,
        weight_used_kg,
        completed,
        exercises (id, name, muscle_group)
      )
    `)
    .eq('user_id', req.user.id)
    .order('started_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ sessions: data })
}

// GET /api/sessions/:id
async function getSessionById(req, res) {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('workout_sessions')
    .select(`
      *,
      routines (id, name, description),
      session_exercises (
        id,
        set_number,
        reps_done,
        weight_used_kg,
        completed,
        exercises (id, name, muscle_group, difficulty)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Sesión no encontrada' })
  }

  if (data.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta sesión' })
  }

  res.json({ session: data })
}

// POST /api/sessions — iniciar una sesión
async function startSession(req, res) {
  const { routine_id, notes } = req.body

  const { data, error } = await supabaseAdmin
    .from('workout_sessions')
    .insert({
      user_id: req.user.id,
      routine_id: routine_id || null,
      started_at: new Date().toISOString(),
      notes,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  // Si viene con rutina, pre-cargar los ejercicios de la rutina
  if (routine_id) {
    const { data: routineExercises } = await supabaseAdmin
      .from('routine_exercises')
      .select('exercise_id, sets, reps, weight_kg')
      .eq('routine_id', routine_id)
      .order('order_index')

    if (routineExercises && routineExercises.length > 0) {
      const sessionExercises = routineExercises.flatMap((re) =>
        Array.from({ length: re.sets }, (_, i) => ({
          session_id: data.id,
          exercise_id: re.exercise_id,
          set_number: i + 1,
          reps_done: re.reps,
          weight_used_kg: re.weight_kg,
          completed: false,
        }))
      )

      await supabaseAdmin
        .from('session_exercises')
        .insert(sessionExercises)
    }
  }

  res.status(201).json({ message: 'Sesión iniciada', session: data })
}

// PUT /api/sessions/:id/finish — terminar una sesión
async function finishSession(req, res) {
  const { id } = req.params
  const { perceived_effort, notes } = req.body

  const endedAt = new Date()

  // Obtener la sesión para calcular duración
  const { data: existing, error: findError } = await supabaseAdmin
    .from('workout_sessions')
    .select('started_at, user_id')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Sesión no encontrada' })
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta sesión' })
  }

  const startedAt = new Date(existing.started_at)
  const durationMin = Math.round((endedAt - startedAt) / (1000 * 60))

  const { data, error } = await supabaseAdmin
    .from('workout_sessions')
    .update({
      ended_at: endedAt.toISOString(),
      duration_min: durationMin,
      perceived_effort,
      notes,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Sesión finalizada', session: data })
}

// PUT /api/sessions/:id/exercises/:sessionExerciseId — marcar serie como completada
async function updateSessionExercise(req, res) {
  const { sessionExerciseId } = req.params
  const { reps_done, weight_used_kg, completed } = req.body

  const { data, error } = await supabaseAdmin
    .from('session_exercises')
    .update({ reps_done, weight_used_kg, completed })
    .eq('id', sessionExerciseId)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Serie actualizada', session_exercise: data })
}

// POST /api/sessions/:id/exercises — agregar ejercicio extra a la sesión
async function addExerciseToSession(req, res) {
  const { id } = req.params
  const { exercise_id, sets, reps_done, weight_used_kg } = req.body

  if (!exercise_id || !sets) {
    return res.status(400).json({ error: 'exercise_id y sets son obligatorios' })
  }

  const sessionExercises = Array.from({ length: sets }, (_, i) => ({
    session_id: id,
    exercise_id,
    set_number: i + 1,
    reps_done: reps_done || 0,
    weight_used_kg: weight_used_kg || null,
    completed: false,
  }))

  const { data, error } = await supabaseAdmin
    .from('session_exercises')
    .insert(sessionExercises)
    .select()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({ message: 'Ejercicio agregado a la sesión', session_exercises: data })
}

// DELETE /api/sessions/:id — borrar sesión
async function deleteSession(req, res) {
  const { id } = req.params

  const { data: existing, error: findError } = await supabaseAdmin
    .from('workout_sessions')
    .select('user_id')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Sesión no encontrada' })
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para borrar esta sesión' })
  }

  const { error } = await supabaseAdmin
    .from('workout_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Sesión eliminada correctamente' })
}

module.exports = {
  getSessions,
  getSessionById,
  startSession,
  finishSession,
  updateSessionExercise,
  addExerciseToSession,
  deleteSession,
}