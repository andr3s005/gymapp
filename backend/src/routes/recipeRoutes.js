const express = require('express');
const router = express.Router();
const { getRecipes, getRecipeById, createRecipe, deleteRecipe } = require('../controllers/recipeController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;