const { supabaseAdmin } = require('../config/supabase');

// GET /api/exercises — lista ejercicios visibles para el usuario actual
async function getExercises(req, res) {
  const { muscle_group, category } = req.query;

  let query = supabaseAdmin
    .from('exercises')
    .select('*')
    .or(`is_custom.eq.false,created_by.eq.${req.user.id}`);

  if (muscle_group) {
    query = query.eq('muscle_group', muscle_group);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('name');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ exercises: data });
}

// GET /api/exercises/:id — un solo ejercicio
async function getExerciseById(req, res) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Ejercicio no encontrado' });
  }

  // Verificación manual: si es personalizado y no es del usuario ni es admin, bloqueamos
  if (data.is_custom && data.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para ver este ejercicio' });
  }

  res.json({ exercise: data });
}

// POST /api/exercises — crear ejercicio (personalizado por usuario, o predefinido por admin)
async function createExercise(req, res) {
  const { name, muscle_group, category, equipment, difficulty, instructions, video_url } = req.body;

  if (!name || !muscle_group) {
    return res.status(400).json({ error: 'name y muscle_group son obligatorios' });
  }

  const isAdmin = req.user.role === 'admin';

  const { data, error } = await supabaseAdmin
    .from('exercises')
    .insert({
      name,
      muscle_group,
      category,
      equipment,
      difficulty,
      instructions,
      video_url,
      is_custom: !isAdmin,
      created_by: req.user.id
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Ejercicio creado correctamente', exercise: data });
}

// PUT /api/exercises/:id — editar ejercicio
async function updateExercise(req, res) {
  const { id } = req.params;
  const { name, muscle_group, category, equipment, difficulty, instructions, video_url } = req.body;

  // Primero verificamos que el ejercicio exista y que el usuario tenga permiso
  const { data: existing, error: findError } = await supabaseAdmin
    .from('exercises')
    .select('created_by, is_custom')
    .eq('id', id)
    .single();

  if (findError) {
    return res.status(404).json({ error: 'Ejercicio no encontrado' });
  }

  const isOwner = existing.created_by === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'No tienes permiso para editar este ejercicio' });
  }

  const { data, error } = await supabaseAdmin
    .from('exercises')
    .update({ name, muscle_group, category, equipment, difficulty, instructions, video_url })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Ejercicio actualizado correctamente', exercise: data });
}

// DELETE /api/exercises/:id
async function deleteExercise(req, res) {
  const { id } = req.params;

  const { data: existing, error: findError } = await supabaseAdmin
    .from('exercises')
    .select('created_by')
    .eq('id', id)
    .single();

  if (findError) {
    return res.status(404).json({ error: 'Ejercicio no encontrado' });
  }

  const isOwner = existing.created_by === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'No tienes permiso para borrar este ejercicio' });
  }

  const { error } = await supabaseAdmin
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Ejercicio eliminado correctamente' });
}

module.exports = { getExercises, getExerciseById, createExercise, updateExercise, deleteExercise };
