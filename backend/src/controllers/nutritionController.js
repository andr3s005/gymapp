const { supabaseAdmin } = require('../config/supabase');

// GET /api/nutrition?date=2026-06-28 — obtener logs del día
async function getNutritionLogs(req, res) {
  const { date } = req.query
  const logDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabaseAdmin
    .from('nutrition_logs')
    .select(`
      *,
      nutrition_log_items (
        id,
        quantity_g,
        calories,
        protein_g,
        foods (id, name, brand, calories_per_100g, protein_g, carbs_g, fat_g),
        recipes (id, name, total_calories, total_protein_g, total_carbs_g, total_fat_g)
      )
    `)
    .eq('user_id', req.user.id)
    .eq('log_date', logDate)
    .order('meal_type')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ logs: data, date: logDate })
}

// GET /api/nutrition/summary/:date — resumen de macros del día
async function getDailySummary(req, res) {
  const { date } = req.params
  const logDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabaseAdmin
    .from('nutrition_logs')
    .select('total_calories, total_protein_g, total_carbs_g, total_fat_g')
    .eq('user_id', req.user.id)
    .eq('log_date', logDate)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // Sumar todos los logs del día
  const summary = data.reduce(
    (totals, log) => ({
      calories: totals.calories + Number(log.total_calories || 0),
      protein_g: totals.protein_g + Number(log.total_protein_g || 0),
      carbs_g: totals.carbs_g + Number(log.total_carbs_g || 0),
      fat_g: totals.fat_g + Number(log.total_fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  res.json({ date: logDate, summary })
}

// POST /api/nutrition — agregar item al log
async function addNutritionLog(req, res) {
  const { meal_type, food_id, recipe_id, quantity_g } = req.body
  const logDate = new Date().toISOString().split('T')[0]

  if (!meal_type || !quantity_g) {
    return res.status(400).json({ error: 'meal_type y quantity_g son obligatorios' })
  }

  if (!food_id && !recipe_id) {
    return res.status(400).json({ error: 'Debes proporcionar food_id o recipe_id' })
  }

  const validMeals = ['breakfast', 'lunch', 'dinner', 'snack']
  if (!validMeals.includes(meal_type)) {
    return res.status(400).json({ error: 'meal_type inválido' })
  }

  // Calcular calorías y proteína del item
  let itemCalories = 0
  let itemProtein = 0

  if (food_id) {
    const { data: food, error: foodError } = await supabaseAdmin
      .from('foods')
      .select('calories_per_100g, protein_g')
      .eq('id', food_id)
      .single()

    if (foodError) {
      return res.status(404).json({ error: 'Alimento no encontrado' })
    }

    const factor = quantity_g / 100
    itemCalories = food.calories_per_100g * factor
    itemProtein = food.protein_g * factor
  }

  if (recipe_id) {
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .select('total_calories, total_protein_g, servings')
      .eq('id', recipe_id)
      .single()

    if (recipeError) {
      return res.status(404).json({ error: 'Receta no encontrada' })
    }

    // Para recetas, quantity_g representa el número de porciones
    const portionFactor = quantity_g / recipe.servings
    itemCalories = recipe.total_calories * portionFactor
    itemProtein = recipe.total_protein_g * portionFactor
  }

  // Buscar o crear el log del día para esta comida
  let log
  const { data: existingLog } = await supabaseAdmin
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('log_date', logDate)
    .eq('meal_type', meal_type)
    .single()

  if (existingLog) {
    log = existingLog
  } else {
    const { data: newLog, error: logError } = await supabaseAdmin
      .from('nutrition_logs')
      .insert({
        user_id: req.user.id,
        log_date: logDate,
        meal_type,
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fat_g: 0,
      })
      .select()
      .single()

    if (logError) {
      return res.status(400).json({ error: logError.message })
    }

    log = newLog
  }

  // Agregar el item al log
  const { data: logItem, error: itemError } = await supabaseAdmin
    .from('nutrition_log_items')
    .insert({
      log_id: log.id,
      food_id: food_id || null,
      recipe_id: recipe_id || null,
      quantity_g,
      calories: Math.round(itemCalories * 10) / 10,
      protein_g: Math.round(itemProtein * 10) / 10,
    })
    .select()
    .single()

  if (itemError) {
    return res.status(400).json({ error: itemError.message })
  }

  // Actualizar los totales del log sumando el nuevo item
  const { error: updateError } = await supabaseAdmin
    .from('nutrition_logs')
    .update({
      total_calories: Number(log.total_calories) + itemCalories,
      total_protein_g: Number(log.total_protein_g) + itemProtein,
    })
    .eq('id', log.id)

  if (updateError) {
    return res.status(400).json({ error: updateError.message })
  }

  res.status(201).json({
    message: 'Item agregado al log correctamente',
    log_item: logItem,
  })
}

// DELETE /api/nutrition/:logItemId — quitar item del log
async function removeNutritionLogItem(req, res) {
  const { logItemId } = req.params

  // Obtener el item para restar sus calorías del total
  const { data: item, error: findError } = await supabaseAdmin
    .from('nutrition_log_items')
    .select('*, nutrition_logs(id, user_id, total_calories, total_protein_g)')
    .eq('id', logItemId)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Item no encontrado' })
  }

  // Verificar que el log pertenece al usuario
  if (item.nutrition_logs.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar este item' })
  }

  // Borrar el item
  const { error: deleteError } = await supabaseAdmin
    .from('nutrition_log_items')
    .delete()
    .eq('id', logItemId)

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message })
  }

  // Restar las calorías del total del log
  const { error: updateError } = await supabaseAdmin
    .from('nutrition_logs')
    .update({
      total_calories: Math.max(0, Number(item.nutrition_logs.total_calories) - Number(item.calories)),
      total_protein_g: Math.max(0, Number(item.nutrition_logs.total_protein_g) - Number(item.protein_g)),
    })
    .eq('id', item.nutrition_logs.id)

  if (updateError) {
    return res.status(400).json({ error: updateError.message })
  }

  res.json({ message: 'Item eliminado del log correctamente' })
}

// GET /api/nutrition/water/:date
async function getWaterLog(req, res) {
  const { date } = req.params
  const logDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabaseAdmin
    .from('water_logs')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('log_date', logDate)
    .single()

  if (error) {
    return res.json({ date: logDate, total_ml: 0 })
  }

  res.json({ date: logDate, total_ml: data.total_ml, log: data })
}

// POST /api/nutrition/water — registrar agua (upsert)
async function logWater(req, res) {
  const { amount_ml } = req.body
  const logDate = new Date().toISOString().split('T')[0]

  if (!amount_ml || amount_ml <= 0) {
    return res.status(400).json({ error: 'amount_ml debe ser mayor a 0' })
  }

  // Buscar si ya existe un log de agua para hoy
  const { data: existing } = await supabaseAdmin
    .from('water_logs')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('log_date', logDate)
    .single()

  let data, error

  if (existing) {
    // Sumar al total existente
    const result = await supabaseAdmin
      .from('water_logs')
      .update({ total_ml: existing.total_ml + Number(amount_ml) })
      .eq('id', existing.id)
      .select()
      .single()
    data = result.data
    error = result.error
  } else {
    // Crear nuevo log
    const result = await supabaseAdmin
      .from('water_logs')
      .insert({
        user_id: req.user.id,
        log_date: logDate,
        total_ml: Number(amount_ml),
      })
      .select()
      .single()
    data = result.data
    error = result.error
  }

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Agua registrada correctamente', water_log: data })
}

module.exports = {
  getNutritionLogs,
  getDailySummary,
  addNutritionLog,
  removeNutritionLogItem,
  getWaterLog,
  logWater,
}