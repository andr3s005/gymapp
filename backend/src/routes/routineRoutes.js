const express = require('express');
const router = express.Router();
const {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  removeExerciseFromRoutine,
} = require('../controllers/routineController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getRoutines);
router.get('/:id', getRoutineById);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

router.post('/:id/exercises', addExerciseToRoutine);
router.put('/:id/exercises/:routineExerciseId', updateRoutineExercise);
router.delete('/:id/exercises/:routineExerciseId', removeExerciseFromRoutine);

module.exports = router;