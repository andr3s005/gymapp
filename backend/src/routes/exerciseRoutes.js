const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');
const { requireAuth } = require('../middleware/auth');

// Todas las rutas de ejercicios requieren estar logueado
router.use(requireAuth);

router.get('/', getExercises);
router.get('/:id', getExerciseById);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

module.exports = router; 
