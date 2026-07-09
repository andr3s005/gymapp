const { supabaseAdmin } = require('../config/supabase');

// Función helper para calcular macros de una receta
function calculateMacros(ingredients) {
  return ingredients.reduce((totals, item) => {
    const factor = item.quantity_g / 100
    return {
      calories: totals.calories + (item.foods.calories_per_100g * factor),
      protein: totals.protein + (item.foods.protein_g * factor),
      carbs: totals.carbs + (item.foods.carbs_g * factor),
      fat: totals.fat + (item.foods.fat_g * factor),
    }
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

// GET /api/recipes
async function getRecipes(req, res) {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        id,
        quantity_g,
        foods (
          id,
          name,
          calories_per_100g,
          protein_g,
          carbs_g,
          fat_g
        )
      )
    `)
    .eq('user_id', req.user.id)
    .order('name')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ recipes: data })
}

// GET /api/recipes/:id
async function getRecipeById(req, res) {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        id,
        quantity_g,
        foods (
          id,
          name,
          brand,
          calories_per_100g,
          protein_g,
          carbs_g,
          fat_g,
          fiber_g
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Receta no encontrada' })
  }

  if (data.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta receta' })
  }

  res.json({ recipe: data })
}

// POST /api/recipes
async function createRecipe(req, res) {
  const { name, servings, instructions, ingredients } = req.body

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la receta es obligatorio' })
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'La receta debe tener al menos un ingrediente' })
  }

  // Obtener datos nutricionales de todos los ingredientes
  const foodIds = ingredients.map((i) => i.food_id)
  const { data: foods, error: foodsError } = await supabaseAdmin
    .from('foods')
    .select('id, calories_per_100g, protein_g, carbs_g, fat_g')
    .in('id', foodIds)

  if (foodsError) {
    return res.status(500).json({ error: foodsError.message })
  }

  // Calcular macros totales
  const ingredientsWithFoods = ingredients.map((ing) => ({
    ...ing,
    foods: foods.find((f) => f.id === ing.food_id),
  }))

  const macros = calculateMacros(ingredientsWithFoods)

  // Crear la receta
  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from('recipes')
    .insert({
      user_id: req.user.id,
      name,
      servings: servings || 1,
      instructions,
      total_calories: Math.round(macros.calories * 10) / 10,
      total_protein_g: Math.round(macros.protein * 10) / 10,
      total_carbs_g: Math.round(macros.carbs * 10) / 10,
      total_fat_g: Math.round(macros.fat * 10) / 10,
    })
    .select()
    .single()

  if (recipeError) {
    return res.status(400).json({ error: recipeError.message })
  }

  // Insertar los ingredientes
  const ingredientRows = ingredients.map((ing) => ({
    recipe_id: recipe.id,
    food_id: ing.food_id,
    quantity_g: ing.quantity_g,
  }))

  const { error: ingredientsError } = await supabaseAdmin
    .from('recipe_ingredients')
    .insert(ingredientRows)

  if (ingredientsError) {
    // Rollback manual — borrar la receta si fallan los ingredientes
    await supabaseAdmin.from('recipes').delete().eq('id', recipe.id)
    return res.status(400).json({ error: ingredientsError.message })
  }

  res.status(201).json({ message: 'Receta creada correctamente', recipe })
}

// DELETE /api/recipes/:id
async function deleteRecipe(req, res) {
  const { id } = req.params

  const { data: existing, error: findError } = await supabaseAdmin
    .from('recipes')
    .select('user_id')
    .eq('id', id)
    .single()

  if (findError) {
    return res.status(404).json({ error: 'Receta no encontrada' })
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para borrar esta receta' })
  }

  const { error } = await supabaseAdmin
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: 'Receta eliminada correctamente' })
}

module.exports = { getRecipes, getRecipeById, createRecipe, deleteRecipe }