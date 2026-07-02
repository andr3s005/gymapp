const { supabaseAdmin } = require('../config/supabase');

// GET /api/routines
async function getRoutines(req, res) {
  const { data, error } = await supabaseAdmin
    .from('routines')
    .select(`
      *,
      routine_exercises (
        id,
        order_index,
        sets,
        reps,
        weight_kg,
        rest_seconds,
        notes,
        exercises (
          id,
          name,
          muscle_group,
          difficulty
        )
      )
    `)
    .or(`user_id.eq.${req.user.id},created_by_coach.eq.${req.user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ routines: data })
}

// GET /api/routines/:id
async function getRoutineById(req, res) {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('routines')
    .select(`
      *,
      routine_exercises (
        id,
        order_index,
        sets,
        reps,
        weight_kg,
        rest_seconds,
        notes,
        exercises (
          id,
          name,
          muscle_group,
          difficulty,
          equipment,
          instructions
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Rutina no encontrada' })
  }

  const isOwner = data.user_id === req.user.id
  const isCoach = data.created_by_coach === req.user.id
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isCoach && !isAdmin) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta rutina' })
  }

  res.json({ routine: data })
}

// POST /api/routines
async function createRoutine(req, res) {
  const { name, description, estimated_duration_min } = req.body

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la rutina es obligatorio' })
  }

  const { data, error } = await supabaseAdmin
    .from('routines')
    .insert({
      user_id: req.user.id,
      name,
      description,
      estimated_duration_min,
      is_public: false,
      is_template: false,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({ message: 'Rutina creada correctamente', routine: data })
}

// PUT /api/routines/:id
async function updateRoutine(req, res) {
  const { id } = req.params
  const { name, description, estimated_duration_min } = req.body

  const { data: existing, error: findError } = await supabaseAdmin
    .from('routines')
    .select('user_id, created_by_coach')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Rutina no encontrada' })
  }

  const isOwner = existing.user_id === req.user.id
  const isCoach = existing.created_by_coach === req.user.id

  if (!isOwner && !isCoach) {
    return res.status(403).json({ error: 'No tienes permiso para editar esta rutina' })
  }

  const { data, error } = await supabaseAdmin
    .from('routines')
    .update({ name, description, estimated_duration_min })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Rutina actualizada correctamente', routine: data })
}

// DELETE /api/routines/:id
async function deleteRoutine(req, res) {
  const { id } = req.params

  const { data: existing, error: findError } = await supabaseAdmin
    .from('routines')
    .select('user_id')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Rutina no encontrada' })
  }

  const isOwner = existing.user_id === req.user.id
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'No tienes permiso para borrar esta rutina' })
  }

  const { error } = await supabaseAdmin
    .from('routines')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Rutina eliminada correctamente' })
}

// POST /api/routines/:id/exercises
async function addExerciseToRoutine(req, res) {
  const { id } = req.params
  const { exercise_id, sets, reps, weight_kg, rest_seconds, notes } = req.body

  if (!exercise_id) {
    return res.status(400).json({ error: 'exercise_id es obligatorio' })
  }

  // Verificar que la rutina existe y el usuario tiene permiso
  const { data: routine, error: findError } = await supabaseAdmin
    .from('routines')
    .select('user_id, created_by_coach')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Rutina no encontrada' })
  }

  const isOwner = routine.user_id === req.user.id
  const isCoach = routine.created_by_coach === req.user.id

  if (!isOwner && !isCoach) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta rutina' })
  }

  // Calcular el order_index del siguiente ejercicio
  const { count } = await supabaseAdmin
    .from('routine_exercises')
    .select('*', { count: 'exact', head: true })
    .eq('routine_id', id)

  const { data, error } = await supabaseAdmin
    .from('routine_exercises')
    .insert({
      routine_id: id,
      exercise_id,
      order_index: count || 0,
      sets: sets || 3,
      reps: reps || 10,
      weight_kg,
      rest_seconds: rest_seconds || 60,
      notes,
    })
    .select(`
      *,
      exercises (id, name, muscle_group, difficulty)
    `)
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({ message: 'Ejercicio agregado a la rutina', routine_exercise: data })
}

// PUT /api/routines/:id/exercises/:routineExerciseId
async function updateRoutineExercise(req, res) {
  const { routineExerciseId } = req.params
  const { sets, reps, weight_kg, rest_seconds, notes, order_index } = req.body

  const { data, error } = await supabaseAdmin
    .from('routine_exercises')
    .update({ sets, reps, weight_kg, rest_seconds, notes, order_index })
    .eq('id', routineExerciseId)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Ejercicio actualizado', routine_exercise: data })
}

// DELETE /api/routines/:id/exercises/:routineExerciseId
async function removeExerciseFromRoutine(req, res) {
  const { routineExerciseId } = req.params

  const { error } = await supabaseAdmin
    .from('routine_exercises')
    .delete()
    .eq('id', routineExerciseId)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Ejercicio eliminado de la rutina' })
}

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  removeExerciseFromRoutine,
}