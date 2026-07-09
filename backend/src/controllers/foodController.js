const { supabaseAdmin } = require('../config/supabase');

// GET /api/foods — buscar alimentos por nombre o código de barras
async function getFoods(req, res) {
  const { search, barcode } = req.query

  let query = supabaseAdmin
    .from('foods')
    .select('*')
    .order('name')
    .limit(20)

  if (barcode) {
    // Búsqueda exacta por código de barras
    query = query.eq('barcode', barcode)
  } else if (search) {
    // Búsqueda parcial por nombre
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ foods: data })
}

// GET /api/foods/:id — obtener un alimento específico
async function getFoodById(req, res) {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('foods')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Alimento no encontrado' })
  }

  res.json({ food: data })
}

// POST /api/foods — agregar alimento al catálogo
async function createFood(req, res) {
  const {
    name, brand, calories_per_100g,
    protein_g, carbs_g, fat_g, fiber_g, barcode
  } = req.body

  if (!name || !calories_per_100g) {
    return res.status(400).json({ error: 'name y calories_per_100g son obligatorios' })
  }

  // Verificar que el código de barras no exista ya
  if (barcode) {
    const { data: existing } = await supabaseAdmin
      .from('foods')
      .select('id, name')
      .eq('barcode', barcode)
      .single()

    if (existing) {
      return res.status(409).json({
        error: 'Este código de barras ya está registrado',
        existing_food: existing,
      })
    }
  }

  const { data, error } = await supabaseAdmin
    .from('foods')
    .insert({
      name,
      brand,
      calories_per_100g: Number(calories_per_100g),
      protein_g: Number(protein_g) || 0,
      carbs_g: Number(carbs_g) || 0,
      fat_g: Number(fat_g) || 0,
      fiber_g: Number(fiber_g) || 0,
      barcode: barcode || null,
      verified: req.user.role === 'admin',
      created_by: req.user.id,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json({ message: 'Alimento agregado correctamente', food: data })
}

module.exports = { getFoods, getFoodById, createFood }